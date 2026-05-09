// src/services/emailService.js
// Calls the local Scot CMS backend server to send emails via Nodemailer.

export const sendNewBookingEmail = async (booking) => {
  try {
    const res = await fetch(`/api/bookings/new`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(booking),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded ${res.status}`);
    }
    console.log('[emailService] New booking notification sent.');
  } catch (err) {
    console.error('[emailService] Failed to notify server:', err.message);
    throw err; // Re-throw to allow caller to handle rollback
  }
};

export const sendStatusUpdateEmail = async (booking) => {
  try {
    const res = await fetch(`/api/bookings/status`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(booking),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded ${res.status}`);
    }
    console.log('[emailService] Status update notification sent.');
  } catch (err) {
    console.error('[emailService] Failed to notify server:', err.message);
    throw err;
  }
};
