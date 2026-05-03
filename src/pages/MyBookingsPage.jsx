// src/pages/MyBookingsPage.jsx
// Shows the current user's bookings with delete capability (Pending only).

import React, { useState } from 'react';
import { useBookings }      from '../hooks/useBookings';
import { deleteBooking }    from '../services/bookingService';
import { useAuth }          from '../store/AuthContext';
import Badge                from '../components/common/Badge';
import Spinner              from '../components/common/Spinner';
import EmptyState           from '../components/common/EmptyState';
import ConfirmDialog        from '../components/common/ConfirmDialog';
import { formatDate }       from '../utils/dateHelpers';
import { BOOKING_STATUS }   from '../utils/constants';
import {
  CalendarDaysIcon,
  ClockIcon,
  BuildingOffice2Icon,
  TrashIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Link }  from 'react-router-dom';
import toast     from 'react-hot-toast';

const MyBookingsPage = () => {
  const { bookings, loading } = useBookings(false);
  const { user }              = useAuth();

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteBooking(toDelete);
      toast.success('Booking cancelled.');
      setToDelete(null);
    } catch {
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-wrap animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Bookings</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">All your room reservation requests.</p>
        </div>
        <Link to="/book" className="btn-primary self-start sm:self-auto">
          + New Booking
        </Link>
      </div>

      {/* Stats row */}
      {!loading && bookings.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { label: 'Total',    value: bookings.length,                                         color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { label: 'Pending',  value: bookings.filter(b => b.status === 'Pending').length,     color: 'text-amber-400',   bg: 'bg-amber-500/10' },
            { label: 'Approved', value: bookings.filter(b => b.status === 'Approved').length,    color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(s => (
            <div key={s.label} className={`glass p-3 sm:p-4 text-center ${s.bg} rounded-xl border border-white/5`}>
              <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Booking list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white/5 h-20 sm:h-24 rounded-2xl w-full" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass">
          <EmptyState
            icon={CalendarDaysIcon}
            title="No bookings yet"
            description="Book a room to see your reservations here."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="glass p-4 sm:p-5 animate-fade-in">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-500/15 flex items-center justify-center shrink-0">
                  <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <p className="font-bold text-white text-sm sm:text-base truncate">{b.room}</p>
                      <Badge status={b.status} />
                    </div>
                    {/* Cancel button — top-right on mobile */}
                    {b.status === BOOKING_STATUS.PENDING && (
                      <button
                        onClick={() => setToDelete(b.id)}
                        className="btn-danger btn-sm shrink-0"
                        title="Cancel booking"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Cancel</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <BuildingOffice2Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{b.building}{b.department ? ` · ${b.department}` : ''}</span>
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />{formatDate(b.date)}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5 shrink-0" />{b.startTime} – {b.endTime}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {b.reason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        danger
      />
    </div>
  );
};

export default MyBookingsPage;
