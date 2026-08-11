import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

dotenv.config();

// Placeholder for Firebase Admin Initialization
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    if (getApps().length === 0) {
      let pk = process.env.FIREBASE_PRIVATE_KEY;
      if (pk.startsWith('"') && pk.endsWith('"')) {
        pk = pk.slice(1, -1);
      }
      pk = pk.replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: pk,
        }),
      });
      console.log('Firebase Admin initialized successfully');
    }
  } else {
    console.warn('Firebase Admin SDK not initialized: Missing environment variables');
  }
} catch (error) {
  console.error('Firebase Admin initialization error', error);
}

export const db = getApps().length ? getFirestore() : null;
export const auth = getApps().length ? getAuth() : null;
export const storage = getApps().length ? getStorage() : null;
