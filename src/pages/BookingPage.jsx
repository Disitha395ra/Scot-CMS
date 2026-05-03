// src/pages/BookingPage.jsx

import React from 'react';
import BookingWizard from '../components/booking/BookingWizard';

const BookingPage = () => (
  <div className="page-wrap animate-fade-in">
    <div className="mb-6 sm:mb-8">
      <h1 className="text-xl sm:text-2xl font-bold text-white">Book a Room</h1>
      <p className="text-slate-400 text-sm mt-1">Follow the steps to reserve your classroom.</p>
    </div>
    <BookingWizard />
  </div>
);

export default BookingPage;
