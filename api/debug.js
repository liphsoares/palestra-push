import { getSubscriptions } from "./redisClient.js";

export default async function handler(req, res) {
  try {
    const subs = await getSubscriptions();

    return res.status(200).json({
      count: subs.length,
      subscriptions: subs
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
