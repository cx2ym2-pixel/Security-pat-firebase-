import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0787413452",
  appId: "1:675108016948:web:a28f94694ff92d1c168b61",
  apiKey: "AIzaSyA5kX5VhWTlYhK8bGOyswQ6mDZXxHKVgWk",
  authDomain: "gen-lang-client-0787413452.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    const creds = await createUserWithEmailAndPassword(auth, "admin@example.com", "password123");
    console.log("Created successfully", creds.user.uid);
    process.exit(0);
  } catch (e: any) {
    console.log("Create failed:", e.message);
    try {
      const creds = await signInWithEmailAndPassword(auth, "admin@example.com", "password123");
      console.log("Sign in successfully", creds.user.uid);
      process.exit(0);
    } catch (e2: any) {
      console.log("Sign in failed:", e2.message);
      process.exit(1);
    }
  }
}
test();
