declare const firebase: any; // Declare firebase as a global variable from the script tag in index.html

// NOTE: In this demo, placeholders are used. 
// For a production build, replace these with your actual Firebase config.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let messaging: any;

/**
 * Initializes the Firebase app and messaging service.
 * Should be called once when the application loads.
 */
export const initializeFirebase = () => {
    // Check if Firebase is available on the window and has not been initialized yet.
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        try {
            firebase.initializeApp(firebaseConfig);
            messaging = firebase.messaging();
            console.log("Firebase initialized for notifications.");
        } catch (e) {
            console.error("Firebase initialization error. Make sure your firebaseConfig placeholders are replaced with actual values for a real deployment.", e);
        }
    }
}

/**
 * Requests permission from the user to show notifications and retrieves the FCM token.
 * @returns {Promise<string | null>} The FCM token if permission is granted, otherwise null.
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
        console.warn("Firebase messaging not initialized. Call initializeFirebase() first.");
        return null;
    }
    
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get the token.
      const token = await messaging.getToken({
        vapidKey: "YOUR_VAPID_KEY", // Replace with your VAPID key
      });

      if (token) {
        console.log('FCM Token:', token);
        // In a real application, you would send this token to your backend server
        // to associate it with the current user and send them targeted notifications.
        return token;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
        console.warn('Notification permission denied.');
        // Optionally, inform the user how to enable notifications later.
        alert('You have denied notification permissions. You can enable them in your browser settings if you change your mind.');
        return null;
    }
  } catch (error) {
    console.error('An error occurred while requesting permission or getting the token: ', error);
    return null;
  }
};