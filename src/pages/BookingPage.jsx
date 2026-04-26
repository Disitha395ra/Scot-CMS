// src/pages/BookingPage.jsx

import React from 'react';
import BookingWizard from '../components/booking/BookingWizard';

const BookingPage = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white">Book a Room</h1>
      <p className="text-slate-400 text-sm mt-1">Follow the steps to reserve your classroom.</p>
    </div>
    <BookingWizard />
  </div>
);

export default BookingPage;
