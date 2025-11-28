import { saveSubscription, getSubscriptions, setSubscriptions } from "./redisClient.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Lê o corpo bruto
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    // parse JSON puro
    const subscription = JSON.parse(body);

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Subscription inválida" });
    }

    const subs = await getSubscriptions();
    const exists = subs.some(s => s.endpoint === subscription.endpoint);

    if (!exists) {
      await saveSubscription(subscription);  // <-- salvando corretamente no Redis
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Erro subscribe:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
