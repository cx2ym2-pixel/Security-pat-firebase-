import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0787413452",
  appId: "1:675108016948:web:a28f94694ff92d1c168b61",
  apiKey: "AIzaSyA5kX5VhWTlYhK8bGOyswQ6mDZXxHKVgWk",
  authDomain: "gen-lang-client-0787413452.firebaseapp.com",
  storageBucket: "gen-lang-client-0787413452.firebasestorage.app",
  messagingSenderId: "675108016948",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-72641c3c-cc8b-436c-91e9-b4a16178b339");
