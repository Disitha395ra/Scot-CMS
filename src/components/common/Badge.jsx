// src/components/common/Badge.jsx

import React from 'react';
import { BOOKING_STATUS } from '../../utils/constants';

const classMap = {
  [BOOKING_STATUS.PENDING]:  'badge-pending',
  [BOOKING_STATUS.APPROVED]: 'badge-approved',
  [BOOKING_STATUS.REJECTED]: 'badge-rejected',
};

const Badge = ({ status }) => (
  <span className={classMap[status] || 'badge bg-white/10 text-slate-400'}>
    {status}
  </span>
);

export default Badge;
