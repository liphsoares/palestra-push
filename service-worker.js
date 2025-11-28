self.addEventListener("push", event => {
  let data = {};

  try {
    data = event.data.json();
  } catch (e) {
    console.error("Push sem JSON:", e);
  }

  const options = {
    body: data.body || "",
    tag: data.tag || "default",
    icon: "/icon.png",
    badge: "/badge.png",
    actions: data.actions || [],
    data: {
      tag: data.tag,
      actions: data.actions
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Nova mensagem", options)
  );
});


// Quando o usuário clicar em um botão da notificação
self.addEventListener("notificationclick", event => {
  const action = event.action;
  const tag = event.notification.data.tag;

  // Envia a resposta para o servidor
  fetch("/api/response", {
    method: "POST",
    body: JSON.stringify({ action, tag }),
    headers: { "Content-Type": "application/json" }
  });

  event.notification.close();
});
