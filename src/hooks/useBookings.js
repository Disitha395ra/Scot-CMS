// src/hooks/useBookings.js
// Real-time booking subscription hook.

import { useState, useEffect } from 'react';
import { subscribeToAllBookings, subscribeToUserBookings } from '../services/bookingService';
import { useAuth } from '../store/AuthContext';

/**
 * Returns all bookings (admin) or user's own bookings (normal user).
 * Updates automatically via Firestore real-time listener.
 */
export const useBookings = (all = false) => {
  const { user, isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const shouldFetchAll = all || isAdmin;

    const unsubscribe = shouldFetchAll
      ? subscribeToAllBookings((data) => { setBookings(data); setLoading(false); })
      : subscribeToUserBookings(user.uid, (data) => { setBookings(data); setLoading(false); });

    return () => { unsubscribe(); };
  }, [user, isAdmin, all]);

  return { bookings, loading, error };
};

/**
 * Returns ALL bookings regardless of role (for dashboard calendar).
 */
export const useAllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllBookings((data) => {
      setBookings(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { bookings, loading };
};
