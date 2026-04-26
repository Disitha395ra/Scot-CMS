// src/services/bookingService.js
// All Firestore CRUD operations for bookings.

import {
  collection, doc, setDoc, getDocs, getDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { BOOKING_STATUS } from '../utils/constants';

const BOOKINGS_COL = 'bookings';

/**
 * Create a new booking document in Firestore.
 * Returns the created document ID.
 */
export const createBooking = async (bookingData) => {
  const docRef = doc(collection(db, BOOKINGS_COL));
  await setDoc(docRef, {
    ...bookingData,
    id: docRef.id,
    status:    BOOKING_STATUS.PENDING,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Fetch all bookings (admin use).
 */
export const getAllBookings = async () => {
  const q   = query(collection(db, BOOKINGS_COL), orderBy('createdAt', 'desc'), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Fetch bookings for a specific user.
 */
export const getUserBookings = async (userId) => {
  const q    = query(collection(db, BOOKINGS_COL), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Fetch bookings for a specific room and date (overlap check).
 */
export const getRoomBookingsForDate = async (room, date) => {
  const q = query(
    collection(db, BOOKINGS_COL),
    where('room', '==', room),
    where('date', '==', date),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Subscribe to all bookings in real-time (for dashboard).
 * Returns unsubscribe function.
 */
export const subscribeToAllBookings = (callback) => {
  const q = query(collection(db, BOOKINGS_COL), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snap) => {
    const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(bookings);
  });
};

/**
 * Subscribe to a user's own bookings in real-time.
 */
export const subscribeToUserBookings = (userId, callback) => {
  const q = query(
    collection(db, BOOKINGS_COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(bookings);
  });
};

/**
 * Update booking status (admin only).
 */
export const updateBookingStatus = async (bookingId, status, adminReason = '') => {
  const ref = doc(db, BOOKINGS_COL, bookingId);
  const data = { status, updatedAt: serverTimestamp() };
  if (adminReason) data.adminReason = adminReason;
  await updateDoc(ref, data);
};

/**
 * Delete a booking document.
 */
export const deleteBooking = async (bookingId) => {
  await deleteDoc(doc(db, BOOKINGS_COL, bookingId));
};

/**
 * Get a single booking by ID.
 */
export const getBookingById = async (bookingId) => {
  const snap = await getDoc(doc(db, BOOKINGS_COL, bookingId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};
