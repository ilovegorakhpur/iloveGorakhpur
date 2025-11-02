
// Scripts for firebase and messaging
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

// NOTE: In this demo, placeholders are used. 
// For a production build, these should be replaced by your build process with environment variables.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // This will be replaced by your build tool
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// A simple check to see if the config seems to be placeholders.
// In a real app, you might have a more robust way to handle this, 
// but for the demo, this prevents initialization with dummy data.
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
      );
      
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg', // A default icon for the notification
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.warn("Firebase Service Worker not initialized. Config is missing or contains placeholders.");
}
