import { getSubscriptions, saveSubscription } from "./redisClient.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let body = Buffer.concat(chunks).toString();

    // Se veio URL-encoded (Safari costuma fazer isso), decodifica
    if (body.startsWith("%7B")) {
      body = decodeURIComponent(body);
    }

    const subscription = JSON.parse(body);

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Subscription inválida" });
    }

    const subs = await getSubscriptions();
    const exists = subs.some(s => s.endpoint === subscription.endpoint);

    if (!exists) {
      await saveSubscription(subscription);
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Erro subscribe:", err);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
