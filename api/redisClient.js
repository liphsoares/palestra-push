const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// executa um comando REST no Upstash
async function redisCommand(command, ...args) {
  const url = `${baseUrl}/${command}/${args.join('/')}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Erro no Redis: ${JSON.stringify(data)}`);
  }

  return data.result;
}

// salvar nova inscrição
export async function saveSubscription(subscription) {
  return await redisCommand(
    "rpush",
    "subscriptions",
    JSON.stringify(subscription)
  );
}

// obter TODAS as inscrições
export async function getSubscriptions() {
  return await redisCommand(
    "lrange",
    "subscriptions",
    0,
    -1
  ).then(list =>
    list.map(item => JSON.parse(item)) // converte JSON string → objeto
  );
}

// salvar lista inteira novamente (caso delete)
export async function setSubscriptions(allSubs) {
  // apaga tudo e reinsere apenas itens válidos
  await redisCommand("del", "subscriptions");

  for (const sub of allSubs) {
    await saveSubscription(sub);
  }
}
