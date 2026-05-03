// src/utils/constants.js
// Central place for all application-level constants.

export const ALLOWED_DOMAIN = 'scot.lk';

export const BUILDINGS = {
  'Building 1': [
    'Board Room',
    'ME Lab',
    'EE Lab',
    'COO Office',
    'Admission Office',
    'Computer Lab',
    'Classroom 101',
    'Classroom 102',
    'Classroom 103',
  ],
  'Building 2': [
    'Library',
    'Registar office',
    'Classroom 301',
    'Classroom 101',
    'Classroom 102',
    'Classroom 201',
    'Classroom 202',
  ],
};

export const BOOKING_STATUS = {
  PENDING: 'Pending',
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

// Per-room seat capacity limits.
// Keys MUST match the room names in BUILDINGS exactly.
export const ROOM_CAPACITY = {
  // Building 1
  'Board Room':       20,
  'ME Lab':           30,
  'EE Lab':           30,
  'COO Office':       15,
  'Admission Office': 15,
  'Computer Lab':     30,
  'Classroom 101':    40,
  'Classroom 102':    40,
  'Classroom 103':    40,
  // Building 2
  'Library':          50,
  'Registar office':  10,
  'Classroom 301':    40,
  'Classroom 201':    40,
  'Classroom 202':    40,
};

