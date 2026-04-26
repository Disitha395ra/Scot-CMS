// src/utils/validators.js
// Booking form validation logic.

import { isPastDateTime, isPastDate, timesOverlap, toMinutes } from './dateHelpers';
import { ALLOWED_DOMAIN, MIN_SEATS, MAX_SEATS } from './constants';

/**
 * Validate all booking form fields before submission.
 * Returns { valid: boolean, errors: { field: string } }
 */
export const validateBooking = ({ date, startTime, endTime, seats, reason, supervisorEmail, existingBookings, room }) => {
  const errors = {};

  // Date checks
  if (!date) {
    errors.date = 'Please select a date.';
  } else if (isPastDate(date)) {
    errors.date = 'Cannot book a past date.';
  }

  // Time checks
  if (!startTime) {
    errors.startTime = 'Please select a start time.';
  } else if (isPastDateTime(date, startTime)) {
    errors.startTime = 'Start time is in the past.';
  }

  if (!endTime) {
    errors.endTime = 'Please select an end time.';
  } else if (startTime && endTime && toMinutes(endTime) <= toMinutes(startTime)) {
    errors.endTime = 'End time must be after start time.';
  }

  // Seats
  const seatNum = Number(seats);
  if (!seats || isNaN(seatNum)) {
    errors.seats = 'Please enter number of seats.';
  } else if (seatNum < MIN_SEATS || seatNum > MAX_SEATS) {
    errors.seats = `Seats must be between ${MIN_SEATS} and ${MAX_SEATS}.`;
  }

  // Reason
  if (!reason || reason.trim().length < 3) {
    errors.reason = 'Please provide a reason (at least 3 characters).';
  }

  // Supervisor email
  if (!supervisorEmail) {
    errors.supervisorEmail = 'Supervisor email is required.';
  } else if (!supervisorEmail.includes('@')) {
    errors.supervisorEmail = 'Please enter a valid email address.';
  }

  // Overlap check (only if date+times are valid so far)
  if (!errors.date && !errors.startTime && !errors.endTime && existingBookings && room) {
    const hasOverlap = existingBookings
      .filter(b => b.room === room && b.date === date)
      .some(b => timesOverlap(startTime, endTime, b.startTime, b.endTime));

    if (hasOverlap) {
      errors.overlap = 'This room is already booked for the selected time slot. Please choose another time.';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate email belongs to allowed domain.
 */
export const validateDomain = (email) => {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
};
