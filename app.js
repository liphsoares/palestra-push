const VAPID_PUBLIC_KEY = "BKadHDKcwxX0QSnLuKbKgfP15GTCOZZUYdeffFBTvjqxUNBxL0PGhSEMno8LK70okAOWZT3TIFkoyIPlsfY87aU";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    alert("Seu navegador não suporta notificações push.");
    return null;
  }

  return navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
}

async function subscribeUser() {
  try {
    const registration = await registerServiceWorker();
    if (!registration) return;

    // Ajuste obrigatório para Samsung Galaxy (S9/S10/S20/S21/A52)
    // Dá tempo do Service Worker ativar antes da permissão
    await new Promise(resolve => setTimeout(resolve, 300));

    // Garante que o SW está realmente ativo
    await navigator.serviceWorker.ready;

    // Pedido de permissão (somente após clique)
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Sem permissão para notificações, a experiência fica limitada.");
      return;
    }

    // Finalmente assina a Push API
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Envia para o backend salvar no Redis
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription)
    });

    alert("Tudo certo. Quando chegar a hora, você vai receber uma notificação.");
  } catch (err) {
    console.error(err);
    alert("Ocorreu um erro ao registrar sua participação.");
  }
}

document.getElementById("btnParticipar")
  .addEventListener("click", subscribeUser);
