import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'default');

async function testRead() {
  try {
    const docRef = doc(db, 'users', 'UFPWkVdefhO911n33RwSlGQKRir1'); // A fake UID
    const docSnap = await getDoc(docRef);
    console.log("Success! Data:", docSnap.data());
  } catch (error: any) {
    console.error("Firestore read failed:", error.message);
    if (error.code) console.error("Error Code:", error.code);
  }
}

testRead();
