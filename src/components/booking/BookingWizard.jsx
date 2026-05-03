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
import { appendBookingRow }       from '../../services/sheetsService';

const STEPS = ['Building', 'Room', 'Details', 'Confirm'];

const BookingWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [searchParams] = useSearchParams();
  
  // Find building from room
  const initialRoom = searchParams.get('room') || '';
  let initialBuilding = '';
  if (initialRoom) {
    import('../../utils/constants').then(({ BUILDINGS }) => {
       // Just a simple find, but since we can't do async inside useState easily, 
       // let's do this synchronously if we just import BUILDINGS at the top.
    });
  }

  const [formData, setFormData] = useState({
    building:        '',
    room:            initialRoom,
    date:            searchParams.get('date') || '',
    startTime:       searchParams.get('start') || '',
    endTime:         '',
    seats:           '',
    reason:          '',
    supervisorEmail: '',
    department:      '',
    programmeName:   '',
    generatorRequired: false,
    generatorReason: '',
  });

  // If initial values are set, jump to Step 3 details
  useEffect(() => {
    if (initialRoom && formData.date && formData.startTime) {
      // we need the building, let's find it
      import('../../utils/constants').then(({ BUILDINGS }) => {
        let bld = '';
        for (const [b, rooms] of Object.entries(BUILDINGS)) {
          if (rooms.includes(initialRoom)) bld = b;
        }
        if (bld) {
          setFormData(f => ({ ...f, building: bld }));
          setStep(2); // Jump to details
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

    // Helper: race any promise against a timeout
    const withTimeout = (promise, ms, fallback) =>
      Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
      ]);

    try {
      // Overlap check — 5s timeout, fall back to empty list if Firestore is slow
      const existing = await withTimeout(
        getRoomBookingsForDate(formData.room, formData.date),
        5000,
        []
      );

      const { valid, errors: errs } = validateBooking({
        ...formData,
        existingBookings: existing,
        room: formData.room,
      });

      if (!valid) {
        setErrors(errs);
        setLoading(false);
        if (errs.date || errs.startTime || errs.endTime || errs.overlap) setStep(2);
        return;
      }

      // Save booking to Firestore — 8s timeout
      const bookingId = await withTimeout(
        createBooking({
          userId:          user.uid,
          userEmail:       user.email,
          userName:        user.displayName || user.email,
          building:        formData.building,
          room:            formData.room,
          date:            formData.date,
          startTime:       formData.startTime,
          endTime:         formData.endTime,
          seats:           Number(formData.seats),
          reason:          formData.reason.trim(),
          supervisorEmail: formData.supervisorEmail.trim().toLowerCase(),
          department:      formData.department,
          programmeName:   formData.programmeName,
          generatorRequired: formData.generatorRequired,
          generatorReason: formData.generatorRequired ? formData.generatorReason : '',
        }),
        8000,
        null
      );

      if (!bookingId) {
        throw new Error('Firestore timed out. Please check your Firebase setup.');
      }

      // Show success immediately
      toast.success('✅ Your request has been submitted! Please wait for admin approval.', {
        duration: 5000,
      });

      // Fire email + sheet recording in background (non-blocking)
      const payload = {
        id:              bookingId,
        userEmail:       user.email,
        userName:        user.displayName || user.email,
        building:        formData.building,
        room:            formData.room,
        date:            formData.date,
        startTime:       formData.startTime,
        endTime:         formData.endTime,
        seats:           Number(formData.seats),
        reason:          formData.reason.trim(),
        supervisorEmail: formData.supervisorEmail.trim().toLowerCase(),
        department:      formData.department,
        programmeName:   formData.programmeName,
        generatorRequired: formData.generatorRequired,
        generatorReason: formData.generatorRequired ? formData.generatorReason : '',
        status:          'Pending',
      };
      sendNewBookingEmail(payload);  // fire and forget
      appendBookingRow(payload);     // fire and forget

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
      <div className="flex items-center mb-8 gap-0">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={i < step ? 'step-done' : i === step ? 'step-active' : 'step-inactive'}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${i === step ? 'text-primary-300' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${i < step ? 'bg-emerald-500' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="glass p-6 sm:p-8 animate-slide-up">
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
