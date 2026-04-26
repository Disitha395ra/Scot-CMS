// src/services/authService.js
// Handles Google Sign-In, domain validation, and user Firestore doc management.

import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { ALLOWED_DOMAIN } from '../utils/constants';

/**
 * Sign in with Google popup.
 * Validates @scot.lk domain.
 * Creates/updates user document in Firestore.
 * Returns { user, role } on success, throws on failure.
 */
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const { user } = result;

  // Domain check
  if (!user.email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
    await signOut(auth); // immediately sign out invalid domain
    throw new Error(`Access denied. Only @${ALLOWED_DOMAIN} accounts are allowed.`);
  }

  // Get or create user document in Firestore
  const userRef  = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  let role = 'user';
  
  // Check fallback admins list first
  const { ADMIN_EMAILS_FALLBACK } = await import('../utils/constants');
  const isFallbackAdmin = ADMIN_EMAILS_FALLBACK.includes(user.email.toLowerCase());

  if (!userSnap.exists()) {
    // Check if email is in admins collection
    const adminRef  = doc(db, 'admins', user.email.toLowerCase());
    const adminSnap = await getDoc(adminRef);
    role = (adminSnap.exists() || isFallbackAdmin) ? 'admin' : 'user';

    await setDoc(userRef, {
      uid:         user.uid,
      email:       user.email.toLowerCase(),
      displayName: user.displayName || '',
      photoURL:    user.photoURL    || '',
      role,
      createdAt:   serverTimestamp(),
    });
  } else {
    // Force role upgrade if they are in the fallback list but were a 'user'
    role = isFallbackAdmin ? 'admin' : (userSnap.data().role || 'user');

    // Sync displayName/photoURL and potentially upgraded role on each login
    await setDoc(userRef, {
      displayName: user.displayName || '',
      photoURL:    user.photoURL    || '',
      role:        role,
    }, { merge: true });
  }

  return { user, role };
};

/**
 * Sign out the current user.
 */
export const signOutUser = async () => {
  await signOut(auth);
};

/**
 * Fetch user role from Firestore.
 */
export const getUserRole = async (uid, email) => {
  const userRef  = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  let role = 'user';
  if (userSnap.exists()) {
    role = userSnap.data().role || 'user';
  }
  
  if (email) {
    const { ADMIN_EMAILS_FALLBACK } = await import('../utils/constants');
    if (ADMIN_EMAILS_FALLBACK.includes(email.toLowerCase())) {
      role = 'admin';
    }
  }

  return role;
};
