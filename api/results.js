import { redis } from "./redisClient.js";

export default async function handler(req, res) {
  const tag = req.query.tag;

  if (!tag) {
    res.status(400).json({ error: "Missing tag" });
    return;
  }

  const key = `resposta:${tag}`;
  const results = await redis.hgetall(key);

  res.status(200).json(results || {});
}
