// app.js

const VAPID_PUBLIC_KEY = "BKadHDKcwxX0QSnLuKbKgfP15GTCOZZUYdeffFBTvjqxUNBxL0PGhSEMno8LK70okAOWZT3TIFkoyIPlsfY87aU"; // substitua aqui

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

  return navigator.serviceWorker.register("/service-worker.js");
}

async function subscribeUser() {
  try {
    const registration = await registerServiceWorker();
    if (!registration) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Sem permissão para notificações, a experiência fica limitada.");
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(subscription)
    });

    alert("Tudo certo. Quando chegar a hora, você vai receber uma notificação.");
  } catch (err) {
    console.error(err);
    alert("Ocorreu um erro ao registrar sua participação.");
  }
}

document.getElementById("btnParticipar").addEventListener("click", () => {
  subscribeUser();
});
