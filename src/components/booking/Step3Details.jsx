// src/components/booking/Step3Details.jsx
// Booking details form: date, times, seats, reason, supervisor email.

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TIME_SLOTS, ROOM_CAPACITY } from '../../utils/constants';

const ErrorMsg = ({ msg }) =>
  msg ? <p className="text-xs text-red-400 mt-1 animate-fade-in">{msg}</p> : null;

const Step3Details = ({ formData, update, errors, setErrors, onNext, onBack }) => {
  const clearErr = (field) => setErrors(e => { const n = { ...e }; delete n[field]; return n; });

  const selectedDate = formData.date
    ? (() => { const [y,m,d] = formData.date.split('-').map(Number); return new Date(y, m-1, d); })()
    : null;

  const handleDate = (date) => {
    if (!date) return;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    update({ date: `${y}-${m}-${d}` });
    clearErr('date');
  };

  const endTimeOptions = formData.startTime
    ? TIME_SLOTS.filter(t => t > formData.startTime)
    : TIME_SLOTS;

  const handleNext = () => {
    // Quick front-end check before hitting Firestore
    const errs = {};
    if (!formData.date)            errs.date            = 'Please select a date.';
    if (!formData.startTime)       errs.startTime       = 'Please select a start time.';
    if (!formData.endTime)         errs.endTime         = 'Please select an end time.';
    if (!formData.seats)           errs.seats           = 'Please enter number of seats.';
    if (!formData.reason?.trim())  errs.reason          = 'Please provide a reason.';
    if (!formData.department)      errs.department      = 'Please select a department.';
    if (!formData.programmeName)   errs.programmeName   = 'Please select a programme name.';
    if (formData.generatorRequired && !formData.generatorReason) errs.generatorReason = 'Please select a reason for the generator.';
    if (!formData.supervisorEmail) errs.supervisorEmail = 'Supervisor email is required.';

    if (Object.keys(errs).length) { setErrors(errs); return; }

    const roomMaxSeats = ROOM_CAPACITY[formData.room] || 200;
    if (Number(formData.seats) > roomMaxSeats) {
      const msg = `You exceed max capacity of this classroom. Max capacity of this room is ${roomMaxSeats}. If you want to exceed this number, enter the reason. Admin panel will review it and inform you.\n\nDo you want to proceed anyway?`;
      if (!window.confirm(msg)) {
        return;
      }
    }

    setErrors({});
    onNext();
  };

  const roomMaxSeats = ROOM_CAPACITY[formData.room] || 200;
  const isOverCapacity = Number(formData.seats) > roomMaxSeats;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-1">
          {formData.building} · {formData.room}
        </p>
        <h2 className="text-xl font-bold text-white mb-1">Booking Details</h2>
        <p className="text-sm text-slate-400">Fill in when you need the room.</p>
      </div>

      {/* Overlap error */}
      {errors.overlap && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fade-in">
          <p className="text-sm text-red-400">{errors.overlap}</p>
        </div>
      )}

      {/* Date */}
      <div className="input-group">
        <label className="input-label" htmlFor="booking-date">Date *</label>
        <DatePicker
          id="booking-date"
          selected={selectedDate}
          onChange={handleDate}
          minDate={new Date()}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select date…"
          className="input"
          calendarClassName="dark-calendar"
          wrapperClassName="w-full"
        />
        <ErrorMsg msg={errors.date} />
      </div>

      {/* Time row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="input-group">
          <label className="input-label" htmlFor="start-time">Start Time *</label>
          <select
            id="start-time"
            className="input"
            value={formData.startTime}
            onChange={e => { update({ startTime: e.target.value, endTime: '' }); clearErr('startTime'); }}
          >
            <option value="">— select —</option>
            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ErrorMsg msg={errors.startTime} />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="end-time">End Time *</label>
          <select
            id="end-time"
            className="input"
            value={formData.endTime}
            onChange={e => { update({ endTime: e.target.value }); clearErr('endTime'); }}
            disabled={!formData.startTime}
          >
            <option value="">— select —</option>
            {endTimeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ErrorMsg msg={errors.endTime} />
        </div>
      </div>

      {/* Seats */}
      <div className="input-group">
        <label className="input-label" htmlFor="seats">Number of Seats *</label>
        <input
          id="seats"
          type="number"
          min="1"
          max="200"
          className="input"
          placeholder="e.g. 30"
          value={formData.seats}
          onChange={e => { update({ seats: e.target.value }); clearErr('seats'); }}
        />
        {isOverCapacity && (
          <p className="text-xs text-yellow-400 mt-2 animate-fade-in bg-yellow-400/10 p-2 rounded border border-yellow-400/30">
            ⚠️ You exceed max capacity of this classroom. Max capacity of this room is {roomMaxSeats}. If you want to exceed this number, enter the reason. Admin panel will review it and inform you.
          </p>
        )}
        <ErrorMsg msg={errors.seats} />
      </div>

      {/* Reason */}
      <div className="input-group">
        <label className="input-label" htmlFor="reason">Reason for Booking *</label>
        <textarea
          id="reason"
          rows={3}
          className="input resize-none"
          placeholder="e.g. Lecture for EE2250, Lab session…"
          value={formData.reason}
          onChange={e => { update({ reason: e.target.value }); clearErr('reason'); }}
        />
        <ErrorMsg msg={errors.reason} />
      </div>

      {/* Department */}
      <div className="input-group">
        <label className="input-label" htmlFor="department">Select Department *</label>
        <select
          id="department"
          className="input"
          value={formData.department || ''}
          onChange={e => { update({ department: e.target.value }); clearErr('department'); }}
        >
          <option value="">— select —</option>
          <option value="C & C">C & C</option>
          <option value="E & E">E & E</option>
          <option value="SoBM">SoBM</option>
          <option value="M & M">M & M</option>
          <option value="Other">Other</option>
        </select>
        <ErrorMsg msg={errors.department} />
      </div>

      {/* Programme Name */}
      <div className="input-group">
        <label className="input-label" htmlFor="programme-name">Programme Name *</label>
        <select
          id="programme-name"
          className="input"
          value={formData.programmeName || ''}
          onChange={e => { update({ programmeName: e.target.value }); clearErr('programmeName'); }}
        >
          <option value="">— select —</option>
          <option value="HND">HND</option>
          <option value="DMU">DMU</option>
          <option value="C&G">C&G</option>
          <option value="Other">Other</option>
        </select>
        <ErrorMsg msg={errors.programmeName} />
      </div>

      {/* Generator */}
      <div className="input-group">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary-500 rounded border-white/20 bg-white/5 focus:ring-primary-500 focus:ring-offset-gray-900"
            checked={formData.generatorRequired || false}
            onChange={e => {
              update({ generatorRequired: e.target.checked });
              if (!e.target.checked) {
                update({ generatorReason: '' });
                clearErr('generatorReason');
              }
            }}
          />
          <span className="text-sm text-slate-200">Generator Required</span>
        </label>
      </div>

      {formData.generatorRequired && (
        <div className="input-group animate-fade-in">
          <label className="input-label" htmlFor="generator-reason">Reason for Generator *</label>
          <select
            id="generator-reason"
            className="input"
            value={formData.generatorReason || ''}
            onChange={e => { update({ generatorReason: e.target.value }); clearErr('generatorReason'); }}
          >
            <option value="">— select —</option>
            <option value="Exam">Exam</option>
            <option value="Conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="presentation">Presentation</option>
            <option value="other">Other</option>
          </select>
          <ErrorMsg msg={errors.generatorReason} />
        </div>
      )}

      {/* Supervisor email */}
      <div className="input-group">
        <label className="input-label" htmlFor="supervisor-email">Supervisor Email *</label>
        <input
          id="supervisor-email"
          type="email"
          className="input"
          placeholder="supervisor@scot.lk"
          value={formData.supervisorEmail}
          onChange={e => { update({ supervisorEmail: e.target.value }); clearErr('supervisorEmail'); }}
        />
        <ErrorMsg msg={errors.supervisorEmail} />
      </div>

      <div className="flex justify-between pt-2">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button id="step3-next-btn" className="btn-primary" onClick={handleNext}>
          Review →
        </button>
      </div>
    </div>
  );
};

export default Step3Details;
