// src/utils/constants.js
// Central place for all application-level constants.

export const ALLOWED_DOMAIN = 'scot.lk';

export const BUILDINGS = {
  'Building 1': [
    'Board Room',
    'ME Lab',
    'EE Lab',
    'Computer Lab',
    'Student Classroom 1',
    'Student Classroom 2',
  ],
  'Building 2': [
    'Library',
    'Registar office',
    'classroom 103',
    'Student Classroom 101',
    'Student Classroom 102',
    'Student Classroom 201',
    'Student Classroom 202',
  ],
};

export const BOOKING_STATUS = {
  PENDING:  'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

// Hardcoded admin emails (fallback — primary source is Firestore /admins collection)
export const ADMIN_EMAILS_FALLBACK = [
  'disitha@scot.lk',
  'admin2@scot.lk',
];

export const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 7; h <= 20; h++) {
    for (const m of [0, 30]) {
      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      slots.push(`${hStr}:${mStr}`);
    }
  }
  return slots;
})();

export const MAX_SEATS = 200;
export const MIN_SEATS = 1;
