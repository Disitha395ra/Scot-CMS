// src/services/emailService.js
// Calls the local Scot CMS backend server to send emails via Nodemailer.

export const sendNewBookingEmail = async (booking) => {
  try {
    const res = await fetch(`/api/bookings/new`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(booking),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    console.log('[emailService] New booking notification sent.');
  } catch (err) {
    console.error('[emailService] Failed to notify server:', err.message);
  }
};

export const sendStatusUpdateEmail = async (booking) => {
  try {
    const res = await fetch(`/api/bookings/status`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(booking),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    console.log('[emailService] Status update notification sent.');
  } catch (err) {
    console.error('[emailService] Failed to notify server:', err.message);
  }
};
