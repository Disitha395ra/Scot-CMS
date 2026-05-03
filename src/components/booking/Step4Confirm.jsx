// src/components/booking/Step4Confirm.jsx
// Review and confirm booking before submission.

import React from 'react';
import { formatDate } from '../../utils/dateHelpers';
import Spinner from '../common/Spinner';

const Row = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 py-2.5 border-b border-white/6 last:border-0">
    <span className="text-xs text-slate-500 shrink-0">{label}</span>
    <span className="text-sm text-slate-200 font-medium text-right">{value || '—'}</span>
  </div>
);

const Step4Confirm = ({ formData: f, onBack, onSubmit, loading }) => {
  const rooms = f.rooms || [];
  const submitLabel = rooms.length > 1 ? `🚀 Submit ${rooms.length} Bookings` : '🚀 Submit Booking';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Confirm Booking</h2>
        <p className="text-sm text-slate-400">Review your details before submitting.</p>
      </div>

      {/* Rooms summary banner when multiple selected */}
      {rooms.length > 1 && (
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 animate-fade-in">
          <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-2">
            {rooms.length} Rooms Selected
          </p>
          <div className="flex flex-wrap gap-2">
            {rooms.map(r => (
              <span key={r} className="text-xs bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded-full px-3 py-1 font-medium">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary card */}
      <div className="bg-surface-800 rounded-2xl p-5 border border-white/8 space-y-0.5">
        <Row label="Building"   value={f.building} />
        <Row label={rooms.length > 1 ? 'Rooms' : 'Room'}
             value={rooms.length === 1 ? rooms[0] : `${rooms.length} rooms selected`} />
        <Row label="Date"       value={formatDate(f.date)} />
        <Row label="Time"       value={`${f.startTime} – ${f.endTime}`} />
        <Row label="Seats"      value={f.seats} />
        <Row label="Department" value={f.department} />
        <Row label="Programme"  value={f.programmeName} />
        <Row label="Reason"     value={f.reason} />
        <Row label="Supervisor" value={f.supervisorEmail} />
        {f.generatorRequired && (
          <Row label="Generator" value={`Yes (${f.generatorReason})`} />
        )}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300">
        ⚠️ Your booking{rooms.length > 1 ? 's' : ''} will be submitted with status <strong>Pending</strong> and must be approved by an admin.
      </div>

      <div className="flex justify-between pt-2">
        <button className="btn-secondary" onClick={onBack} disabled={loading}>← Back</button>
        <button
          id="submit-booking-btn"
          className="btn-primary btn-lg"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? <><Spinner size="sm" /> Submitting…</> : submitLabel}
        </button>
      </div>
    </div>
  );
};

export default Step4Confirm;
