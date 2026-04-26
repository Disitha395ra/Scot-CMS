// src/utils/dateHelpers.js
// Utility functions for date/time manipulation.

import { format, isAfter, isBefore, parseISO, isToday, startOfDay } from 'date-fns';

/**
 * Format a date string or Date object.
 * @param {Date|string} date
 * @param {string} fmt - date-fns format string
 */
export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
};

/**
 * Format a Firestore Timestamp to a readable string.
 */
export const formatTimestamp = (ts, fmt = 'dd MMM yyyy, hh:mm a') => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return format(d, fmt);
};

/**
 * Check if a given date+time is in the past.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - HH:MM
 */
export const isPastDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return false;
  const [year, month, day]   = dateStr.split('-').map(Number);
  const [hour, minute]       = timeStr.split(':').map(Number);
  const dt = new Date(year, month - 1, day, hour, minute);
  return isBefore(dt, new Date());
};

/**
 * Check if date string is in the past (date only).
 */
export const isPastDate = (dateStr) => {
  if (!dateStr) return false;
  return isBefore(startOfDay(parseISO(dateStr)), startOfDay(new Date()));
};

/**
 * Check if two time ranges overlap.
 * Times are HH:MM strings.
 */
export const timesOverlap = (startA, endA, startB, endB) => {
  return startA < endB && endA > startB;
};

/**
 * Convert HH:MM to total minutes.
 */
export const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Return today's date as YYYY-MM-DD.
 */
export const todayStr = () => format(new Date(), 'yyyy-MM-dd');

/**
 * Combine YYYY-MM-DD and HH:MM into a JS Date object.
 */
export const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

/**
 * Parse a YYYY-MM-DD string into a JS Date (local time, midnight).
 */
export const parseDateStr = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};
