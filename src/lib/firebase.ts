// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const configuredApiKey = import.meta.env.VITE_API_KEY?.trim();
export const isFirebaseConfigured = Boolean(configuredApiKey && configuredApiKey !== "your_firebase_api_key");

// Keep Firebase imports safe during local setup; ProtectedRoute prevents requests until configured.
const firebaseConfig = {
  apiKey: configuredApiKey || "dev-placeholder-api-key",
  authDomain: "react-chat-app-72301.firebaseapp.com",
  projectId: "react-chat-app-72301",
  storageBucket: "react-chat-app-72301.appspot.com",
  messagingSenderId: "696950571746",
  appId: "1:696950571746:web:f0b072dd7a6307164054bb"
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
