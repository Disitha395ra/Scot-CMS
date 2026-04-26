// src/components/booking/Step1Building.jsx

import React from 'react';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { BUILDINGS } from '../../utils/constants';

const Step1Building = ({ formData, update, onNext }) => {
  const buildings = Object.keys(BUILDINGS);

  const select = (b) => { update({ building: b, room: '' }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Select Building</h2>
        <p className="text-sm text-slate-400">Choose the building you want to book a room in.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {buildings.map(b => (
          <button
            key={b}
            id={`building-${b.replace(/\s/g, '-').toLowerCase()}`}
            onClick={() => select(b)}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 active:scale-97
              ${formData.building === b
                ? 'border-primary-500 bg-primary-500/15 shadow-lg shadow-primary-500/20'
                : 'border-white/10 bg-white/4 hover:border-white/25 hover:bg-white/8'
              }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
              ${formData.building === b ? 'bg-primary-500/30' : 'bg-white/8'}`}
            >
              <BuildingOffice2Icon className={`w-6 h-6 ${formData.building === b ? 'text-primary-300' : 'text-slate-400'}`} />
            </div>
            <p className={`font-bold text-base ${formData.building === b ? 'text-white' : 'text-slate-300'}`}>{b}</p>
            <p className="text-xs text-slate-500 mt-1">{BUILDINGS[b].length} rooms available</p>

            {formData.building === b && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          id="step1-next-btn"
          onClick={onNext}
          disabled={!formData.building}
          className="btn-primary"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Step1Building;
