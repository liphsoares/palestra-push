import { getSubscriptions, saveSubscription } from "./redisClient.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Lê manualmente o body (Vercel não parseia sozinho)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let body = Buffer.concat(chunks).toString();

    // Se veio URL-encoded (Safari iOS), decodifica
    if (body.startsWith("%7B")) {
      body = decodeURIComponent(body);
    }

    let subscription;
    try {
      subscription = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON", received: body });
    }

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Subscription inválida" });
    }

    await saveSubscription(subscription);

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Erro subscribe:", err);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
