import { redis } from "./redisClient.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { action, tag } = req.body;

  if (!action || !tag) {
    res.status(400).json({ error: "Missing action or tag" });
    return;
  }

  // Chave no redis: resposta:TAG
  const key = `resposta:${tag}`;

  await redis.hincrby(key, action, 1);

  res.status(200).json({ ok: true });
}
