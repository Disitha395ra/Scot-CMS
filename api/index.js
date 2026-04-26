// server/index.js
// Local Express backend for Scot CMS — handles email + Google Sheets.
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const app  = express();
const PORT = 3001;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

const getSheets = () => {
  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
  } catch (e) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e.message);
    return null;
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
};

const getSpreadsheetId = () => {
  const raw = process.env.GOOGLE_SHEET_ID || '';
  const match = raw.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : raw;
};

const SHEET_NAME = 'Bookings';
const HEADERS = [
  'Booking ID', 'User Name', 'User Email', 'Supervisor Email',
  'Building', 'Room', 'Date', 'Start Time', 'End Time',
  'Seats', 'Reason', 'Status', 'Created At', 'Programme',
];

const bookingToRow = (b) => [
  b.id || '',
  b.userName || '',
  b.userEmail || '',
  b.supervisorEmail || '',
  b.building || '',
  b.room || '',
  b.date || '',
  b.startTime || '',
  b.endTime || '',
  String(b.seats || ''),
  b.reason || '',
  b.status || 'Pending',
  b.createdAt || new Date().toISOString(),
  b.programmeName || '',
];

// ─── Email HTML Templates ───────────────────────────────────────────────────

const base = (content) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}
  .hdr{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center}
  .hdr h1{color:#fff;font-size:22px;margin:0} .hdr p{color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px}
  .body{padding:32px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .field{margin-bottom:16px} .lbl{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:4px}
  .val{font-size:15px;color:#e2e8f0;font-weight:500}
  .divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:20px 0}
  .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600}
  .Pending{background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.3)}
  .Approved{background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.3)}
  .Rejected{background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.3)}
  .ftr{padding:20px 32px;background:#0f172a;text-align:center;font-size:12px;color:#475569}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>🎓 Scot Classroom Management System</h1><p>Room Booking Notification</p></div>
  <div class="body">${content}</div>
  <div class="ftr">This is an automated email from Scot CMS. Please do not reply.</div>
</div></body></html>`;

const newBookingHtml = (b) => base(`
  <h2 style="color:#e2e8f0;margin-top:0">New Room Booking Request</h2>
  <p style="color:#94a3b8;font-size:14px;margin-bottom:24px">A new room booking has been submitted and is awaiting your approval.</p>
  <div class="grid">
    <div class="field"><div class="lbl">Booked By</div><div class="val">${b.userName}</div></div>
    <div class="field"><div class="lbl">Email</div><div class="val">${b.userEmail}</div></div>
    <div class="field"><div class="lbl">Building</div><div class="val">${b.building}</div></div>
    <div class="field"><div class="lbl">Room</div><div class="val">${b.room}</div></div>
    <div class="field"><div class="lbl">Date</div><div class="val">${b.date}</div></div>
    <div class="field"><div class="lbl">Time</div><div class="val">${b.startTime} – ${b.endTime}</div></div>
    <div class="field"><div class="lbl">Seats</div><div class="val">${b.seats}</div></div>
    <div class="field"><div class="lbl">Programme</div><div class="val">${b.programmeName || '—'}</div></div>
    <div class="field"><div class="lbl">Status</div><div class="val"><span class="badge Pending">Pending</span></div></div>
  </div>
  <hr class="divider"/>
  <div class="field"><div class="lbl">Reason</div><div class="val">${b.reason}</div></div>
  <div class="field"><div class="lbl">Supervisor</div><div class="val">${b.supervisorEmail}</div></div>
  <div class="field"><div class="lbl">Booking ID</div><div class="val" style="font-family:monospace;font-size:12px;color:#64748b">${b.id}</div></div>
`);

const statusUpdateHtml = (b) => {
  const icon = b.status === 'Approved' ? '✅' : '❌';
  return base(`
    <h2 style="color:#e2e8f0;margin-top:0">${icon} Booking ${b.status}</h2>
    <p style="color:#94a3b8;font-size:14px;margin-bottom:24px">
      Your room booking has been <strong style="color:#e2e8f0">${b.status.toLowerCase()}</strong> by an administrator.
    </p>
    <div class="grid">
      <div class="field"><div class="lbl">Room</div><div class="val">${b.room}</div></div>
      <div class="field"><div class="lbl">Building</div><div class="val">${b.building}</div></div>
      <div class="field"><div class="lbl">Date</div><div class="val">${b.date}</div></div>
      <div class="field"><div class="lbl">Time</div><div class="val">${b.startTime} – ${b.endTime}</div></div>
      <div class="field"><div class="lbl">Seats</div><div class="val">${b.seats}</div></div>
      <div class="field"><div class="lbl">Programme</div><div class="val">${b.programmeName || '—'}</div></div>
      <div class="field"><div class="lbl">Status</div><div class="val"><span class="badge ${b.status}">${b.status}</span></div></div>
    </div>
    <hr class="divider"/>
    <div class="field"><div class="lbl">User Reason</div><div class="val">${b.reason}</div></div>
    ${b.adminReason ? `<div class="field"><div class="lbl">Admin Note / Reason</div><div class="val" style="color:#f87171">${b.adminReason}</div></div>` : ''}
    <div class="field"><div class="lbl">Booking ID</div><div class="val" style="font-family:monospace;font-size:12px;color:#64748b">${b.id}</div></div>
  `);
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ─── Direct Google Sheet Stats Endpoint ──────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const sheets = getSheets();
    if (!sheets) return res.status(500).json({ error: 'No sheets configured' });
    const spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) return res.status(500).json({ error: 'No sheet ID' });

    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEET_NAME}!A:N` });
    const rows = resp.data.values || [];
    
    const dataRows = rows.slice(1); // skip header
    let approved = 0;
    let pending  = 0;
    let today    = 0;
    
    // Create today string in local timezone (Sri Lanka / standard format)
    const d = new Date();
    const todayStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    dataRows.forEach(row => {
      const date   = row[6] || '';  // G
      const status = row[11] || ''; // L
      if (status === 'Approved') approved++;
      if (status === 'Pending') pending++;
      if (date === todayStr) today++;
    });

    res.json({ total: dataRows.length, pending, approved, today });
  } catch (err) {
    console.error('[STATS ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// New booking → email + sheet row
app.post('/api/bookings/new', async (req, res) => {
  const booking = req.body;
  console.log('[NEW BOOKING]', booking.id, booking.room, booking.date);

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  const recipients  = [...new Set([booking.userEmail, booking.supervisorEmail, ...adminEmails])].filter(Boolean);

  const results = await Promise.allSettled([
    // Send email
    (async () => {
      const transporter = createTransporter();
      await transporter.sendMail({
        from:    `"Scot CMS" <${process.env.GMAIL_USER}>`,
        to:      recipients.join(', '),
        subject: `[Scot CMS] New Booking: ${booking.room} on ${booking.date}`,
        html:    newBookingHtml(booking),
      });
      console.log('[EMAIL SENT] New booking →', recipients.join(', '));
    })(),

    // Append to sheet
    (async () => {
      const sheets = getSheets();
      if (!sheets) return;
      const spreadsheetId = getSpreadsheetId();
      if (!spreadsheetId) { console.warn('[SHEETS] No spreadsheet ID.'); return; }

      // Ensure header row exists
      const check = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEET_NAME}!A1` });
      if (!check.data.values || !check.data.values[0]) {
        await sheets.spreadsheets.values.update({
          spreadsheetId, range: `${SHEET_NAME}!A1`, valueInputOption: 'RAW',
          requestBody: { values: [HEADERS] },
        });
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range:            `${SHEET_NAME}!A:N`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody:      { values: [bookingToRow(booking)] },
      });
      console.log('[SHEETS] Row appended for', booking.id);
    })(),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[ERROR] Task ${i === 0 ? 'email' : 'sheets'}:`, r.reason?.message || r.reason);
  });

  res.json({ ok: true });
});

// Status update → email + update sheet cell
app.post('/api/bookings/status', async (req, res) => {
  const booking = req.body; // { id, status, userEmail, supervisorEmail, ... }
  console.log('[STATUS UPDATE]', booking.id, '→', booking.status);

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  const recipients  = [...new Set([booking.userEmail, booking.supervisorEmail, ...adminEmails])].filter(Boolean);

  const results = await Promise.allSettled([
    // Send email
    (async () => {
      const transporter = createTransporter();
      await transporter.sendMail({
        from:    `"Scot CMS" <${process.env.GMAIL_USER}>`,
        to:      recipients.join(', '),
        subject: `[Scot CMS] Booking ${booking.status}: ${booking.room} on ${booking.date}`,
        html:    statusUpdateHtml(booking),
      });
      console.log('[EMAIL SENT] Status update →', recipients.join(', '));
    })(),

    // Update sheet status
    (async () => {
      const sheets = getSheets();
      if (!sheets) return;
      const spreadsheetId = getSpreadsheetId();
      if (!spreadsheetId) return;

      const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEET_NAME}!A:A` });
      const rows = resp.data.values || [];
      const rowIndex = rows.findIndex(r => r[0] === booking.id);
      if (rowIndex === -1) { console.warn('[SHEETS] Booking not found in sheet:', booking.id); return; }

      const sheetRow = rowIndex + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range:            `${SHEET_NAME}!L${sheetRow}`,
        valueInputOption: 'RAW',
        requestBody:      { values: [[booking.status]] },
      });
      console.log(`[SHEETS] Row ${sheetRow} status updated to "${booking.status}"`);
    })(),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[ERROR] Task ${i === 0 ? 'email' : 'sheets'}:`, r.reason?.message || r.reason);
  });

  res.json({ ok: true });
});

// ─── Start ───────────────────────────────────────────────────────────────────
// When deployed on Vercel, it acts as a serverless function, so we export it.
// When running locally, we listen on the port.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n✅ Scot CMS backend running on http://localhost:${PORT}`);
    console.log(`   Gmail user  : ${process.env.GMAIL_USER}`);
    console.log(`   Sheet ID    : ${getSpreadsheetId() || '(not set)'}`);
    console.log(`   Admin emails: ${process.env.ADMIN_EMAILS}`);
    console.log('');
  });
}

module.exports = app;
