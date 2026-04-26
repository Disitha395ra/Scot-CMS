// src/pages/DashboardPage.jsx
// Main dashboard with a monthly calendar and today's booking list.

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useAllBookings } from '../hooks/useBookings';
import { useAuth } from '../store/AuthContext';
import { formatDate, parseDateStr } from '../utils/dateHelpers';
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
  const { bookings, loading } = useAllBookings();
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
      start: parseDateStr(b.date) || new Date(),
      end:   parseDateStr(b.date) || new Date(),
      resource: b,
    })),
    [bookings],
  );

  const handleEventClick = (event) => setSelectedBooking(event.resource);

  const handleDayClick = (date) => {
    setSelectedDay(format(date, 'yyyy-MM-dd'));
  };

  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, today: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch live stats from Google Sheets via backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch sheet stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
    // Refresh stats every 10 seconds to keep it synced with Google Sheet edits
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <Link to="/book" className="btn-primary">
          <AcademicCapIcon className="w-4 h-4" />
          Book a Room
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: stats.total,    color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Pending',        value: stats.pending,  color: 'text-amber-400',   bg: 'bg-amber-500/10' },
          { label: 'Approved',       value: stats.approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: "Today's Events", value: stats.today,    color: 'text-accent-400',  bg: 'bg-accent-500/10' },
        ].map(s => (
          <div key={s.label} className="glass p-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <CalendarDaysIcon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{statsLoading ? '—' : s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Calendar — 3 cols */}
        <div className="lg:col-span-3 glass p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4 text-primary-400" />
            Booking Calendar
            {loading && <Spinner size="sm" className="ml-2" />}
          </h2>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            defaultView="month"
            views={['month']}
            style={{ height: 420 }}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={handleEventClick}
            selectable={true}
            onSelectSlot={(slotInfo) => handleDayClick(slotInfo.start)}
            onDrillDown={(date) => handleDayClick(date)}
            eventPropGetter={() => ({})}
            className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
          />
        </div>

        {/* Today's bookings — 2 cols */}
        <div className="lg:col-span-2 glass p-4 sm:p-6 flex flex-col">
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
