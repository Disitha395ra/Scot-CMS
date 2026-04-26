// src/services/sheetsService.js
// Calls the local Scot CMS backend server which writes to Google Sheets.

// Re-export so callers don't need to change their imports.
// The actual sheet write happens inside the server /api/bookings/new endpoint,
// so these are intentional no-ops at the client level (server handles both).

export const appendBookingRow = async (_booking) => {
  // Handled by the server inside /api/bookings/new (called from emailService)
};

export const updateSheetStatus = async (_bookingId, _status) => {
  // Handled by the server inside /api/bookings/status (called from emailService)
};
