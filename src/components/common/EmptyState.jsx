// src/components/common/EmptyState.jsx

import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ icon: Icon = CalendarDaysIcon, title = 'Nothing here yet', description = '' }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
    <div className="w-20 h-20 rounded-3xl bg-primary-500/10 flex items-center justify-center mb-5 border border-primary-500/20">
      <Icon className="w-10 h-10 text-primary-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
  </div>
);

export default EmptyState;
