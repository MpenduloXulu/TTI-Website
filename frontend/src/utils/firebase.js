// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5RM0ASlj3NgbaoefMCgie1H1W71Vvaeg",
  authDomain: "tti-application-management.firebaseapp.com",
  projectId: "tti-application-management",
  storageBucket: "tti-application-management.firebasestorage.app",
  messagingSenderId: "447087790656",
  appId: "1:447087790656:web:8a4a380ca2435a4150eda5",
  measurementId: "G-KJTL2D4WLQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Export services for use throughout the app
export {
  app,
  auth,
  db,
  storage,
  analytics
};

export default app;
