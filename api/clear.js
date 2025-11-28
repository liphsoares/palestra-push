import { clearSubscriptions } from "./redisClient.js";

export default async function handler(req, res) {
  await clearSubscriptions();
  res.status(200).json({ ok: true });
}
