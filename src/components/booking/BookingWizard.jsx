// src/components/booking/BookingWizard.jsx
// 4-step multi-step booking form with progress indicator.

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import Step1Building from './Step1Building';
import Step2Room     from './Step2Room';
import Step3Details  from './Step3Details';
import Step4Confirm  from './Step4Confirm';

import { createBooking }          from '../../services/bookingService';
import { getRoomBookingsForDate } from '../../services/bookingService';
import { validateBooking }        from '../../utils/validators';
import { useAuth }                from '../../store/AuthContext';

import { sendNewBookingEmail }    from '../../services/emailService';

const STEPS = ['Building', 'Room', 'Details', 'Confirm'];

const BookingWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [searchParams] = useSearchParams();

  // Support deep-link: ?room=X&date=Y&start=Z
  const initialRoom = searchParams.get('room') || '';

  const [formData, setFormData] = useState({
    building:          '',
    rooms:             initialRoom ? [initialRoom] : [],   // ← array
    date:              searchParams.get('date') || '',
    startTime:         searchParams.get('start') || '',
    endTime:           '',
    seats:             '',
    reason:            '',
    supervisorEmail:   '',
    department:        '',
    programmeName:     '',
    generatorRequired: false,
    generatorReason:   '',
  });

  // If deep-linked with room+date+start, jump straight to Step 3
  useEffect(() => {
    if (initialRoom && formData.date && formData.startTime) {
      import('../../utils/constants').then(({ BUILDINGS }) => {
        let bld = '';
        for (const [b, rooms] of Object.entries(BUILDINGS)) {
          if (rooms.includes(initialRoom)) bld = b;
        }
        if (bld) {
          setFormData(f => ({ ...f, building: bld }));
          setStep(2);
        }
      });
    }
  }, []);

  const update = (fields) => setFormData(prev => ({ ...prev, ...fields }));

  // ─── Navigation ────────────────────────────────────────────────────────────

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 0)); };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true);

    const withTimeout = (promise, ms, fallback) =>
      Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
      ]);

    try {
      const rooms = formData.rooms;

      // ── 1. Field-level validation (date, time, seats, etc.) ───────────────
      const { valid, errors: fieldErrs } = validateBooking({
        ...formData,
        existingBookings: [],
        room: rooms[0],
      });

      // ── 2. Overlap check per room in parallel ─────────────────────────────
      const overlapErrors = [];
      await Promise.all(
        rooms.map(async (room) => {
          const existing = await withTimeout(
            getRoomBookingsForDate(room, formData.date),
            5000,
            []
          );
          const { errors: errs } = validateBooking({
            ...formData,
            existingBookings: existing,
            room,
          });
          if (errs.overlap) overlapErrors.push(`${room}: ${errs.overlap}`);
        })
      );

      if (!valid || overlapErrors.length > 0) {
        const combined = { ...fieldErrs };
        if (overlapErrors.length > 0) combined.overlap = overlapErrors.join('\n');
        setErrors(combined);
        setLoading(false);
        if (fieldErrs.date || fieldErrs.startTime || fieldErrs.endTime || overlapErrors.length > 0) setStep(2);
        return;
      }

      // ── 3. Create one booking doc per room in parallel ────────────────────
      const commonPayload = {
        userId:            user.uid,
        userEmail:         user.email,
        userName:          user.displayName || user.email,
        building:          formData.building,
        date:              formData.date,
        startTime:         formData.startTime,
        endTime:           formData.endTime,
        seats:             Number(formData.seats),
        reason:            formData.reason.trim(),
        supervisorEmail:   formData.supervisorEmail.trim().toLowerCase(),
        department:        formData.department,
        programmeName:     formData.programmeName,
        generatorRequired: formData.generatorRequired,
        generatorReason:   formData.generatorRequired ? formData.generatorReason : '',
      };

      const bookingIds = await withTimeout(
        Promise.all(rooms.map(room => createBooking({ ...commonPayload, room }))),
        10000,
        null
      );

      if (!bookingIds) {
        throw new Error('Firestore timed out. Please check your Firebase setup.');
      }

      const roomLabel = rooms.length === 1 ? rooms[0] : `${rooms.length} rooms`;
      toast.success(`✅ ${roomLabel} booked! Waiting for admin approval.`, { duration: 5000 });

      // ── 4. Fire email (backend handles sheet row too) ─────────────────────
      bookingIds.forEach((bookingId, idx) => {
        const payload = {
          ...commonPayload,
          id:     bookingId,
          room:   rooms[idx],
          status: 'Pending',
        };
        sendNewBookingEmail(payload); // backend also writes to Google Sheet
      });

      navigate('/');
    } catch (err) {
      console.error('[handleSubmit]', err);
      toast.error(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const stepProps = { formData, update, errors, setErrors };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center mb-6 sm:mb-8 gap-0">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={i < step ? 'step-done' : i === step ? 'step-active' : 'step-inactive'}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 font-medium hidden xs:block ${i === step ? 'text-primary-300' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-3 sm:mb-4 rounded-full transition-all duration-500 ${i < step ? 'bg-emerald-500' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="glass p-4 sm:p-6 md:p-8 animate-slide-up">
        {step === 0 && <Step1Building {...stepProps} onNext={next} />}
        {step === 1 && <Step2Room     {...stepProps} onNext={next} onBack={back} />}
        {step === 2 && <Step3Details  {...stepProps} onNext={next} onBack={back} />}
        {step === 3 && (
          <Step4Confirm
            {...stepProps}
            onBack={back}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default BookingWizard;
