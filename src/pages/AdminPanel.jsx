// src/pages/AdminPanel.jsx
// Admin panel: view all bookings, approve/reject with status toggle.

import React, { useState, useMemo } from 'react';
import { useBookings }         from '../hooks/useBookings';
import { updateBookingStatus } from '../services/bookingService';
import { sendStatusUpdateEmail } from '../services/emailService';
import { updateSheetStatus }     from '../services/sheetsService';
import Badge   from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { formatDate, formatTimestamp } from '../utils/dateHelpers';
import { BOOKING_STATUS }      from '../utils/constants';
import {
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['All', BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED, BOOKING_STATUS.REJECTED];

const AdminPanel = () => {
  const { bookings, loading } = useBookings(true); // fetch all
  const [filter,  setFilter]  = useState('All');
  const [search,  setSearch]  = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [updating, setUpdating] = useState({});   // { bookingId: true }
  
  // Modal state
  const [actionModal, setActionModal] = useState({ isOpen: false, bookingId: null, status: null });
  const [adminReason, setAdminReason] = useState('');

  const filtered = useMemo(() => {
    let list = bookings;
    if (filter !== 'All') list = list.filter(b => b.status === filter);
    if (dateFilter) list = list.filter(b => b.date === dateFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        (b.room         || '').toLowerCase().includes(q) ||
        (b.userName     || '').toLowerCase().includes(q) ||
        (b.userEmail    || '').toLowerCase().includes(q) ||
        (b.building     || '').toLowerCase().includes(q) ||
        (b.reason       || '').toLowerCase().includes(q) ||
        (b.programmeName|| '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, filter, search, dateFilter]);

  const handleDownloadCSV = () => {
    if (filtered.length === 0) return toast.error('No records to download');
    
    const headers = ['Booked By', 'Email', 'Building', 'Room', 'Programme', 'Date', 'Start', 'End', 'Seats', 'Status', 'Reason', 'Admin Reason'];
    const rows = filtered.map(b => [
      `"${b.userName || b.userEmail}"`,
      `"${b.userEmail}"`,
      `"${b.building}"`,
      `"${b.room}"`,
      `"${b.programmeName || ''}"`,
      `"${b.date}"`,
      `"${b.startTime}"`,
      `"${b.endTime}"`,
      b.seats,
      `"${b.status}"`,
      `"${(b.reason || '').replace(/"/g, '""')}"`,
      `"${(b.adminReason || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeStatusUpdate = async () => {
    const { bookingId, status } = actionModal;
    if (!bookingId) return;

    setUpdating(u => ({ ...u, [bookingId]: true }));
    setActionModal({ isOpen: false, bookingId: null, status: null });
    
    try {
      await updateBookingStatus(bookingId, status, adminReason);
      
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        sendStatusUpdateEmail({ ...booking, status, adminReason });
        updateSheetStatus(bookingId, status);
      }

      toast.success(`Booking ${status.toLowerCase()} successfully.`);
    } catch {
      toast.error('Failed to update status. Please try again.');
    } finally {
      setUpdating(u => { const n = { ...u }; delete n[bookingId]; return n; });
      setAdminReason('');
    }
  };

  const confirmAction = (bookingId, status) => {
    setActionModal({ isOpen: true, bookingId, status });
    setAdminReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent-500/15 flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 text-sm">Manage all room booking requests.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge bg-accent-500/20 text-accent-400 border border-accent-500/30 text-sm px-3 py-1.5">
            {bookings.length} total bookings
          </div>
          <button onClick={handleDownloadCSV} className="btn-secondary btn-sm flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download Details
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-dark p-4 mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="admin-search"
            type="search"
            placeholder="Search by room, user, reason…"
            className="input pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Date Filter */}
        <div className="relative">
          <input
            type="date"
            className="input w-full sm:w-auto"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>
        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              className={`btn btn-sm transition-all ${
                filter === f
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'btn-secondary'
              }`}
            >
              <FunnelIcon className="w-3.5 h-3.5" />
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3 mt-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="animate-pulse bg-white/5 h-16 rounded-xl w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass">
          <EmptyState title="No bookings found" description="Try changing your search or filter." />
        </div>
      ) : (
        <div className="table-container">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  {['User', 'Room / Building', 'Date & Time', 'Seats', 'Status', 'Actions'].map(h => (
                    <th key={h} className="table-cell py-3 text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="table-row">
                    <td className="table-cell">
                      <p className="font-medium text-white">{b.userName || b.userEmail}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">{b.userEmail}</p>
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-slate-200">{b.room}</p>
                      <p className="text-xs text-slate-500">
                        {b.building}{b.programmeName ? ` • ${b.programmeName}` : ''}
                      </p>
                    </td>
                    <td className="table-cell">
                      <p className="text-slate-200">{formatDate(b.date)}</p>
                      <p className="text-xs text-slate-500">{b.startTime} – {b.endTime}</p>
                    </td>
                    <td className="table-cell">{b.seats}</td>
                    <td className="table-cell"><Badge status={b.status} /></td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        {b.status !== BOOKING_STATUS.APPROVED && (
                          <button
                            id={`approve-${b.id}`}
                            onClick={() => confirmAction(b.id, BOOKING_STATUS.APPROVED)}
                            disabled={updating[b.id]}
                            className="btn-success btn-sm"
                          >
                            {updating[b.id]
                              ? <Spinner size="sm" />
                              : <CheckCircleIcon className="w-4 h-4" />
                            }
                            Approve
                          </button>
                        )}
                        {b.status !== BOOKING_STATUS.REJECTED && (
                          <button
                            id={`reject-${b.id}`}
                            onClick={() => confirmAction(b.id, BOOKING_STATUS.REJECTED)}
                            disabled={updating[b.id]}
                            className="btn-danger btn-sm"
                          >
                            {updating[b.id]
                              ? <Spinner size="sm" />
                              : <XCircleIcon className="w-4 h-4" />
                            }
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-white/6">
            {filtered.map(b => (
              <div key={b.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{b.room}</p>
                    <p className="text-xs text-slate-500">
                      {b.building}{b.programmeName ? ` • ${b.programmeName}` : ''}
                    </p>
                  </div>
                  <Badge status={b.status} />
                </div>
                <p className="text-xs text-slate-400">{b.userName || b.userEmail}</p>
                <p className="text-xs text-slate-400">{formatDate(b.date)} · {b.startTime}–{b.endTime}</p>
                <div className="flex gap-2 pt-1">
                  {b.status !== BOOKING_STATUS.APPROVED && (
                    <button onClick={() => confirmAction(b.id, BOOKING_STATUS.APPROVED)} disabled={updating[b.id]} className="btn-success btn-sm flex-1">
                      {updating[b.id] ? <Spinner size="sm" /> : '✓'} Approve
                    </button>
                  )}
                  {b.status !== BOOKING_STATUS.REJECTED && (
                    <button onClick={() => confirmAction(b.id, BOOKING_STATUS.REJECTED)} disabled={updating[b.id]} className="btn-danger btn-sm flex-1">
                      {updating[b.id] ? <Spinner size="sm" /> : '✕'} Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, bookingId: null, status: null })}
        title={`Confirm ${actionModal.status}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to <strong className={actionModal.status === BOOKING_STATUS.APPROVED ? 'text-emerald-400' : 'text-red-400'}>{actionModal.status?.toLowerCase()}</strong> this booking?
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Reason (Optional)</label>
            <textarea
              className="input w-full min-h-[100px]"
              placeholder="Provide a reason for the user..."
              value={adminReason}
              onChange={e => setAdminReason(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setActionModal({ isOpen: false, bookingId: null, status: null })}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={executeStatusUpdate}
              className={`${actionModal.status === BOOKING_STATUS.APPROVED ? 'btn-success' : 'btn-danger'} flex-1`}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPanel;
