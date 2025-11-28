// api/redisClient.js

const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.warn("UPSTASH_REDIS_REST_URL ou UPSTASH_REDIS_REST_TOKEN não configurados.");
}

async function redisCommand(commandArray) {
  const res = await fetch(UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ command: commandArray })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Erro no Redis: " + text);
  }

  const data = await res.json();
  return data.result;
}

export async function getSubscriptions() {
  const result = await redisCommand(["GET", "push_subscriptions"]);
  if (!result) return [];
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}

export async function setSubscriptions(subs) {
  await redisCommand(["SET", "push_subscriptions", JSON.stringify(subs)]);
}
