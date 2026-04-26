// src/components/dashboard/DayViewModal.jsx
import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import { TIME_SLOTS, BUILDINGS, BOOKING_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/dateHelpers';
import Badge from '../common/Badge';
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// Flatten all rooms into a single array
const ALL_ROOMS = Object.values(BUILDINGS).flat();

const DayViewModal = ({ isOpen, onClose, date, bookings }) => {
  const [selectedRoom, setSelectedRoom] = useState(ALL_ROOMS[0]);

  // Generate explicit 1-hour blocks from 08:30 to 17:30
  const timelineBlocks = useMemo(() => {
    if (!date || !selectedRoom) return [];

    const roomBookings = bookings.filter(b => 
      b.date === date && 
      b.room === selectedRoom && 
      b.status !== BOOKING_STATUS.REJECTED
    );

    const intervals = [
      { start: '08:30', end: '09:30' },
      { start: '09:30', end: '10:30' },
      { start: '10:30', end: '11:30' },
      { start: '11:30', end: '12:30' },
      { start: '12:30', end: '13:30' },
      { start: '13:30', end: '14:30' },
      { start: '14:30', end: '15:30' },
      { start: '15:30', end: '16:30' },
      { start: '16:30', end: '17:30' },
    ];

    return intervals.map(interval => {
      // Find any booking that overlaps with this interval
      const overlappingBookings = roomBookings.filter(b => {
        return b.startTime < interval.end && b.endTime > interval.start;
      });

      if (overlappingBookings.length > 0) {
        return {
          type: 'busy',
          startTime: interval.start,
          endTime: interval.end,
          bookings: overlappingBookings // could be multiple if they booked 30 mins
        };
      } else {
        return {
          type: 'free',
          startTime: interval.start,
          endTime: interval.end
        };
      }
    });
  }, [date, selectedRoom, bookings]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Overview" size="lg">
      <div className="animate-fade-in space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">{formatDate(date)}</h2>
            <p className="text-sm text-slate-400">View free and scheduled slots</p>
          </div>
          
          <div className="min-w-[200px]">
            <select
              className="input w-full"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              {Object.entries(BUILDINGS).map(([buildingName, rooms]) => (
                <optgroup key={buildingName} label={buildingName} className="bg-surface-800 text-white">
                  {rooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-surface-800 rounded-xl border border-white/10 p-2 max-h-[500px] overflow-y-auto">
          {timelineBlocks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No time slots available.</div>
          ) : (
            <div className="space-y-2">
              {timelineBlocks.map((block, idx) => (
                <div key={idx}>
                  {block.type === 'free' ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-emerald-400 font-semibold text-sm">Free Slot</p>
                          <p className="text-xs text-emerald-500/80 font-mono mt-0.5">
                            {block.startTime} – {block.endTime}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/book?date=${date}&room=${encodeURIComponent(selectedRoom)}&start=${block.startTime}`}
                        className="btn-success btn-sm w-full sm:w-auto text-center"
                      >
                        Book This Time
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col p-3 sm:p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-4">
                      <div className="flex items-center gap-3 border-b border-red-500/20 pb-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                          <XCircleIcon className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-red-400 font-semibold text-sm">Booked Slot</p>
                          <p className="text-xs text-red-500/80 font-mono mt-0.5">
                            {block.startTime} – {block.endTime}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {block.bookings.map(booking => (
                          <div key={booking.id} className="ml-11">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <p className="text-red-300 font-medium text-sm line-clamp-1">
                                Booked by {booking.userName || booking.userEmail}
                              </p>
                              <Badge status={booking.status} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-red-400/80 font-mono flex items-center gap-1.5">
                                <ClockIcon className="w-3.5 h-3.5" />
                                Exact: {booking.startTime} – {booking.endTime}
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                                <AcademicCapIcon className="w-3.5 h-3.5 shrink-0" />
                                {booking.reason}
                              </p>
                              {booking.programmeName && (
                                <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                                  <UserIcon className="w-3.5 h-3.5 shrink-0" />
                                  Programme: {booking.programmeName}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DayViewModal;
