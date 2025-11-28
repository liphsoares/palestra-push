// api/send.js
import webpush from "web-push";
import { getSubscriptions, setSubscriptions } from "./redisClient.js";

const {
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  ADMIN_TOKEN
} = process.env;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn("VAPID_PUBLIC_KEY ou VAPID_PRIVATE_KEY não configurados.");
}

webpush.setVapidDetails(
  "mailto:seu-email@exemplo.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const token = url.searchParams.get("token");

  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Não autorizado" }));
    return;
  }

  try {
    const subs = await getSubscriptions();

    if (!subs || subs.length === 0) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Nenhum dispositivo inscrito." }));
      return;
    }

    const payload = JSON.stringify({
      title: "Boas Práticas Digitais – Experiência ao vivo",
      body: "Percebeu? Seu cérebro respondeu ao toque antes mesmo de você decidir.",
      url: "https://seu-dominio-ou-pagina.com"
    });

    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(sub, payload).catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            return { remove: true, endpoint: sub.endpoint };
          }
          throw err;
        })
      )
    );

    // remove inscrições inválidas
    let changed = false;
    const validSubs = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const sub = subs[i];
      if (
        r.status === "fulfilled" &&
        !(r.value && r.value.remove)
      ) {
        validSubs.push(sub);
      } else if (
        r.status === "fulfilled" &&
        r.value &&
        r.value.remove
      ) {
        changed = true;
      } else if (r.status === "rejected") {
        console.error("Erro ao enviar para um subscription:", r.reason);
        validSubs.push(sub); // mantém, só logou erro
      }
    }

    if (changed) {
      await setSubscriptions(validSubs);
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message: `Notificação enviada para ${subs.length} dispositivos (alguns podem ter sido removidos por estarem inválidos).`
      })
    );
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Erro ao enviar notificações" }));
  }
}
