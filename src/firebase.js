import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuhwrRVgy0GZb96QIVB5EeDkyfh8bhDmA",
  authDomain: "bibliotheque-chants.firebaseapp.com",
  projectId: "bibliotheque-chants",
  storageBucket: "bibliotheque-chants.firebasestorage.app",
  messagingSenderId: "731423389845",
  appId: "1:731423389845:web:8b26067afb859e6757839c"
};

// getApps() vérifie si Firebase est déjà initialisé pour éviter les doublons
import { getApps } from "firebase/app";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);