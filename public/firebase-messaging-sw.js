// Firebase Cloud Messaging Service Worker
// This file handles background notifications

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

// Initialize Firebase in the service worker
// Note: Replace these with your actual Firebase config values
firebase.initializeApp({
  apiKey: "AIzaSyCc7rW_EhmrYyfvisKYtHiFgTuYQrky5-o",
  authDomain: "hiphopcal-7ba72.firebaseapp.com",
  projectId: "hiphopcal-7ba72",
  storageBucket: "hiphopcal-7ba72.firebasestorage.app",
  messagingSenderId: "845324131314",
  appId: "1:845324131314:web:b8e4eef48c8b7aa1f0a96b",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload,
  );

  const notificationTitle = payload.notification?.title || "New Album";
  const notificationOptions = {
    body: payload.notification?.body || "A new album has been added",
    icon: payload.notification?.image || "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked:", event);

  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }

        // Otherwise open a new window
        if (clients.openWindow) {
          const albumId = event.notification.data?.albumId;
          const url = albumId ? `/albums/${albumId}` : "/";
          return clients.openWindow(url);
        }
      }),
  );
});
