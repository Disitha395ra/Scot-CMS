// src/components/common/ConfirmDialog.jsx
// Simple confirm/cancel dialog built on Modal.

import React from 'react';
import Modal from './Modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title   = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  danger  = true,
  loading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="flex gap-4">
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/10' : 'bg-primary-500/10'}`}>
        <ExclamationTriangleIcon className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-primary-400'}`} />
      </div>
      <p className="text-sm text-slate-300 pt-2">{message}</p>
    </div>
    <div className="flex gap-3 mt-6 justify-end">
      <button className="btn-secondary btn-sm" onClick={onClose} disabled={loading}>
        Cancel
      </button>
      <button
        className={danger ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? 'Processing…' : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
