// src/components/common/Spinner.jsx

import React from 'react';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-12 h-12 border-3',
};

const Spinner = ({ size = 'md', className = '' }) => (
  <div
    className={`${sizes[size]} border-primary-500 border-t-transparent rounded-full animate-spin ${className}`}
    role="status"
    aria-label="Loading…"
  />
);

export default Spinner;
