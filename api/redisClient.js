import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const KEY = "subscriptions";

export async function getSubscriptions() {
  try {
    const data = await redis.get(KEY);

    if (!data) return [];

    let raw = typeof data === "string" ? data : data.toString();

    // Se veio URL-encoded (%7B %5B etc)
    if (raw.startsWith("%7B") || raw.startsWith("%5B")) {
      raw = decodeURIComponent(raw);
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (err) {
    console.error("Erro ao ler subscriptions:", err);
    return [];
  }
}

export async function saveSubscription(subscription) {
  try {
    const subs = await getSubscriptions();

    const exists = subs.some(s => s.endpoint === subscription.endpoint);

    if (!exists) {
      subs.push(subscription);
      await redis.set(KEY, JSON.stringify(subs));
    }
  } catch (err) {
    console.error("Erro ao salvar subscription:", err);
  }
}

export async function clearSubscriptions() {
  try {
    await redis.del(KEY);
  } catch (err) {
    console.error("Erro ao limpar Redis:", err);
  }
}
