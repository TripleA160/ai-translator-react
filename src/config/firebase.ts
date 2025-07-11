import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const app = firebase.initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  gemeniApiKey: import.meta.env.VITE_GEMENI_API_KEY,
});

export const auth = firebase.auth(app);

export const geminiAi = getAI(app, { backend: new GoogleAIBackend() });
export const geminiModelMain = getGenerativeModel(geminiAi, {
  model: "gemini-2.0-flash",
});
export const geminiModelLite = getGenerativeModel(geminiAi, {
  model: "gemini-2.0-flash-lite",
});

export default app;
