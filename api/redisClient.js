import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "subscriptions";

export async function getSubscriptions() {
  try {
    const data = await redis.get(KEY);

    if (!data) return [];

    // Caso 1: Já é array (Upstash pode devolver objetos reais)
    if (Array.isArray(data)) {
      return data;
    }

    // Caso 2: É um objeto único (não deveria, mas pode ter sido salvo assim)
    if (typeof data === "object") {
      return [data];
    }

    // Caso 3: É string (correta ou URL-encoded)
    if (typeof data === "string") {
      
      let raw = data;

      // Se veio URL-encoded (%7B %5B etc)
      if (raw.startsWith("%7B") || raw.startsWith("%5B")) {
        raw = decodeURIComponent(raw);
      }

      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        console.error("Falha ao JSON.parse:", raw);
        return [];
      }
    }

    return [];
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
