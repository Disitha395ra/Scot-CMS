// src/pages/DashboardPage.jsx
// Main dashboard with a monthly calendar and today's booking list.

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useAllBookings, useBookings } from '../hooks/useBookings';
import { useAuth } from '../store/AuthContext';
import { formatDate, parseDateStr, combineDateAndTime, isPastDate } from '../utils/dateHelpers';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import DayViewModal from '../components/dashboard/DayViewModal';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const locales   = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const DashboardPage = () => {
  const { bookings, loading } = useAllBookings();           // all bookings → calendar
  const { bookings: myBookings } = useBookings(false);       // own bookings → stats
  const { user, isAdmin }     = useAuth();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDay,     setSelectedDay]     = useState(null);
  const [currentDate,     setCurrentDate]     = useState(new Date());

  // Today's bookings (sorted by start time)
  const todayStr    = format(new Date(), 'yyyy-MM-dd');
  const todayEvents = useMemo(
    () => bookings.filter(b => b.date === todayStr).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings, todayStr],
  );

  // Calendar events
  const calendarEvents = useMemo(() =>
    bookings.map(b => ({
      id:    b.id,
      title: `${b.room} — ${b.startTime}`,
      start: combineDateAndTime(b.date, b.startTime) || new Date(),
      end:   combineDateAndTime(b.date, b.endTime) || new Date(),
      resource: b,
    })),
    [bookings],
  );

  const handleEventClick = (event) => setSelectedBooking(event.resource);

  const dayPropGetter = (date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    if (isPastDate(dStr)) {
      return {
        className: 'past-day',
        style: {
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          opacity: 0.6,
          cursor: 'not-allowed'
        }
      };
    }
    return {};
  };

  const handleDayClick = (date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    if (isPastDate(dStr)) {
      toast.error("You can't book for past dates. Please select a future date.", {
        icon: '📅',
        style: {
          borderRadius: '10px',
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }
      });
      return;
    }
    setSelectedDay(dStr);
  };

  // Compute stats from the user's own bookings (Firestore real-time)
  const stats = useMemo(() => ({
    total:    myBookings.length,
    pending:  myBookings.filter(b => b.status === 'Pending').length,
    approved: myBookings.filter(b => b.status === 'Approved').length,
    today:    myBookings.filter(b => b.date === todayStr).length,
  }), [myBookings, todayStr]);
  const statsLoading = loading;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <Link to="/book" className="btn-primary self-start sm:self-auto">
          <AcademicCapIcon className="w-4 h-4" />
          Book a Room
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'My Bookings',    value: stats.total,    color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'My Pending',     value: stats.pending,  color: 'text-amber-400',   bg: 'bg-amber-500/10' },
          { label: 'My Approved',    value: stats.approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: "My Today",       value: stats.today,    color: 'text-accent-400',  bg: 'bg-accent-500/10' },
        ].map(s => (
          <div key={s.label} className="glass p-3 sm:p-4">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${s.bg} flex items-center justify-center mb-2 sm:mb-3`}>
              <CalendarDaysIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{statsLoading ? '—' : s.value}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Calendar — 3 cols */}
        <div className="lg:col-span-3 glass p-3 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 sm:mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4 text-primary-400" />
            Booking Calendar
            {loading && <Spinner size="sm" className="ml-2" />}
          </h2>
          <div className="dashboard-calendar">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              defaultView="month"
              views={['month']}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectEvent={handleEventClick}
              selectable={true}
              onSelectSlot={(slotInfo) => handleDayClick(slotInfo.start)}
              onDrillDown={(date) => handleDayClick(date)}
              longPressThreshold={10}
              dayPropGetter={dayPropGetter}
              eventPropGetter={() => ({})}
              className={`transition-opacity duration-300 ${loading && calendarEvents.length === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
            />
          </div>
        </div>

        {/* Today's bookings — 2 cols */}
        <div className="lg:col-span-2 glass p-3 sm:p-6 flex flex-col">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-accent-400" />
            Today's Bookings
            {!loading && (
              <span className="ml-auto badge bg-accent-500/20 text-accent-400 border-accent-500/30">
                {todayEvents.length}
              </span>
            )}
          </h2>

          {loading ? (
            <div className="flex-1 flex flex-col gap-3">
              {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white/5 h-20 rounded-xl" />)}
            </div>
          ) : todayEvents.length === 0 ? (
            <EmptyState
              icon={CalendarDaysIcon}
              title="No bookings today"
              description="Click 'Book a Room' to get started."
            />
          ) : (
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {todayEvents.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="w-full text-left glass-dark p-4 rounded-xl hover:border-primary-500/40 border border-transparent transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-white text-sm group-hover:text-primary-300 transition-colors line-clamp-1">{b.room}</p>
                    <Badge status={b.status} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {b.startTime} – {b.endTime}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <BuildingOffice2Icon className="w-3.5 h-3.5" />
                      {b.building}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <UserIcon className="w-3.5 h-3.5 shrink-0" />
                      {b.userName || b.userEmail}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking detail modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title="Booking Details"
          size="md"
        >
          <BookingDetailView booking={selectedBooking} />
        </Modal>
      )}

      {/* Daily Overview Modal */}
      {selectedDay && (
        <DayViewModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          date={selectedDay}
          bookings={bookings}
        />
      )}
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-white/6 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-primary-500/15 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-primary-400" />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-200 font-medium mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const BookingDetailView = ({ booking: b }) => (
  <div className="space-y-0.5 animate-fade-in">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-bold text-white">{b.room}</h3>
      <Badge status={b.status} />
    </div>
    <DetailRow icon={BuildingOffice2Icon} label="Building" value={b.building} />
    <DetailRow icon={CalendarDaysIcon} label="Date" value={formatDate(b.date)} />
    <DetailRow icon={ClockIcon} label="Time" value={`${b.startTime} – ${b.endTime}`} />
    <DetailRow icon={UserIcon} label="Booked by" value={b.userName || b.userEmail} />
    <DetailRow icon={UserIcon} label="Supervisor" value={b.supervisorEmail} />
    <DetailRow icon={AcademicCapIcon} label="Seats" value={b.seats} />
    <DetailRow icon={AcademicCapIcon} label="Reason" value={b.reason} />
  </div>
);

export default DashboardPage;
