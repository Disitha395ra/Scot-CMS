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
        <p className="text-sm text-slate-400">You can select <span className="text-primary-300 font-semibold">multiple rooms</span> for a combined booking.</p>
      </div>

      {/* Selected count badge */}
      {formData.rooms?.length > 0 && (
        <div className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-xl px-4 py-2.5 animate-fade-in">
          <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {formData.rooms.length}
          </span>
          <p className="text-sm text-primary-300 font-medium line-clamp-1">
            {formData.rooms.length === 1
              ? `${formData.rooms[0]} selected`
              : `${formData.rooms.join(', ')}`}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {rooms.map(room => {
          const selected = formData.rooms?.includes(room);
          return (
            <button
              key={room}
              id={`room-${room.replace(/\s/g, '-').toLowerCase()}`}
              onClick={() => {
                const current = formData.rooms || [];
                const next = selected
                  ? current.filter(r => r !== room)
                  : [...current, room];
                update({ rooms: next });
              }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 active:scale-97
                ${selected
                  ? 'border-primary-500 bg-primary-500/15 shadow-md shadow-primary-500/15'
                  : 'border-white/10 bg-white/4 hover:border-white/25 hover:bg-white/8'
                }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                ${selected ? 'bg-primary-500/30' : 'bg-white/8'}`}
              >
                <AcademicCapIcon className={`w-5 h-5 ${selected ? 'text-primary-300' : 'text-slate-500'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-slate-300'}`}>{room}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                ${selected ? 'bg-primary-500 border-primary-500' : 'border-white/20 bg-transparent'}`}
              >
                {selected && <span className="text-white text-xs font-bold leading-none">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button
          id="step2-next-btn"
          className="btn-primary"
          onClick={onNext}
          disabled={!formData.rooms?.length}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Step2Room;
