self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Boas Práticas Digitais", body: "Notificação recebida." };
  }

  const title = data.title || "Boas Práticas Digitais";
  const options = {
    body: data.body || "Seu cérebro respondeu antes mesmo de você pensar.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: data.url || null
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
