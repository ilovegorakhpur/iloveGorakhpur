
declare const firebase: any; // Declare firebase as a global variable from the script tag in index.html

// NOTE: In this demo, placeholders are used. 
// For a production build, replace these with your actual Firebase config.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
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
            // Check if required config values are present. This prevents crashes if env vars are not set.
            if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
                firebase.initializeApp(firebaseConfig);
                messaging = firebase.messaging();
                console.log("Firebase initialized for notifications.");
            } else {
                 console.warn("Firebase config is missing. Please set up your environment variables. Notifications will be disabled.");
            }
        } catch (e) {
            console.error("Firebase initialization error. Make sure your environment variables are set correctly.", e);
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
        console.warn("Firebase messaging not initialized. Call initializeFirebase() first or check your config.");
        return null;
    }
    
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get the token.
      const token = await messaging.getToken({
        vapidKey: process.env.FIREBASE_VAPID_KEY, // Replace with your VAPID key via env var
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
