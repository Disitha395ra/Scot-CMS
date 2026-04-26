// src/components/booking/Step2Room.jsx

import React from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { BUILDINGS } from '../../utils/constants';

const Step2Room = ({ formData, update, onNext, onBack }) => {
  const rooms = BUILDINGS[formData.building] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-1">{formData.building}</p>
        <h2 className="text-xl font-bold text-white mb-1">Select Room</h2>
        <p className="text-sm text-slate-400">Choose the room you want to book.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {rooms.map(room => (
          <button
            key={room}
            id={`room-${room.replace(/\s/g, '-').toLowerCase()}`}
            onClick={() => update({ room })}
            className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 active:scale-97
              ${formData.room === room
                ? 'border-primary-500 bg-primary-500/15 shadow-md shadow-primary-500/15'
                : 'border-white/10 bg-white/4 hover:border-white/25 hover:bg-white/8'
              }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
              ${formData.room === room ? 'bg-primary-500/30' : 'bg-white/8'}`}
            >
              <AcademicCapIcon className={`w-5 h-5 ${formData.room === room ? 'text-primary-300' : 'text-slate-500'}`} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${formData.room === room ? 'text-white' : 'text-slate-300'}`}>{room}</p>
            </div>
            {formData.room === room && (
              <div className="ml-auto w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button
          id="step2-next-btn"
          className="btn-primary"
          onClick={onNext}
          disabled={!formData.room}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Step2Room;
