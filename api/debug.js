import { getSubscriptions } from "./redisClient.js";

export default async function handler(req, res) {
  try {
    const data = await getSubscriptions();

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ subscriptions: data }, null, 2));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message }));
  }
}
