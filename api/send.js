import webpush from "web-push";
import { getSubscriptions } from "./redisClient.js";

const {
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  ADMIN_TOKEN
} = process.env;

webpush.setVapidDetails(
  "mailto:contato@exemplo.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const url = new URL(req.url, "http://localhost");
    const token = url.searchParams.get("token");

    if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Recebe a notificação personalizada enviada pelo painel
    const { title, body, actions, tag } = req.body;

    const payload = JSON.stringify({
      title: title || "Nova Notificação",
      body: body || "",
      actions: actions || [],
      tag: tag || "default"
    });

    const subs = await getSubscriptions();
    const results = [];

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
        results.push({ endpoint: sub.endpoint, ok: true });
      } catch (err) {
        results.push({
          endpoint: sub.endpoint,
          ok: false,
          error: err.message
        });
      }
    }

    return res.status(200).json({
      total: subs.length,
      sucesso: results.filter(r => r.ok).length,
      falhas: results.filter(r => !r.ok),
      resultados: results
    });

  } catch (err) {
    console.error("Erro send:", err);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
