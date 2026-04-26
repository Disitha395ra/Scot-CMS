// src/services/firebase.js
// Firebase app initialization — all Firebase services exported from here.

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth      = getAuth(app);
export const db        = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
export const functions = getFunctions(app, 'us-central1');

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ hd: 'scot.lk' }); // hint domain on Google picker

export default app;
