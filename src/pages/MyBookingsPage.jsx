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
import { formatDate, formatTimestamp } from '../utils/dateHelpers';
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
  const { bookings, loading } = useBookings(false);   // user-scoped
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Bookings</h1>
          <p className="text-slate-400 text-sm mt-1">All your room reservation requests.</p>
        </div>
        <Link to="/book" className="btn-primary">
          + New Booking
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white/5 h-24 rounded-2xl w-full" />)}
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
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="glass p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in">
              {/* Left: icon */}
              <div className="w-12 h-12 rounded-2xl bg-primary-500/15 flex items-center justify-center shrink-0">
                <AcademicCapIcon className="w-6 h-6 text-primary-400" />
              </div>

              {/* Mid: details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-white">{b.room}</p>
                  <Badge status={b.status} />
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <BuildingOffice2Icon className="w-3.5 h-3.5" />
                    {b.building}{b.programmeName ? ` • ${b.programmeName}` : ''}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />{formatDate(b.date)}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />{b.startTime} – {b.endTime}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">
                  Reason: {b.reason}
                </p>
              </div>

              {/* Right: action */}
              {b.status === BOOKING_STATUS.PENDING && (
                <button
                  onClick={() => setToDelete(b.id)}
                  className="btn-danger btn-sm shrink-0"
                  title="Cancel booking"
                >
                  <TrashIcon className="w-4 h-4" />
                  Cancel
                </button>
              )}
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
