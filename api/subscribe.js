// api/subscribe.js
import { getSubscriptions, setSubscriptions } from "./redisClient.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    const subscription = JSON.parse(body || "{}");

    if (!subscription || !subscription.endpoint) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Subscription inválida" }));
      return;
    }

    const subs = await getSubscriptions();
    const exists = subs.some(s => s.endpoint === subscription.endpoint);

    if (!exists) {
      subs.push(subscription);
      await setSubscriptions(subs);
    }

    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Erro interno" }));
  }
}
