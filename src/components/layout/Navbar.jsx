// src/components/layout/Navbar.jsx

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { signOutUser } from '../../services/authService';
import { useAuth } from '../../store/AuthContext';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/',            label: 'Dashboard',   icon: HomeIcon          },
  { to: '/book',        label: 'Book Room',    icon: PlusCircleIcon    },
  { to: '/my-bookings', label: 'My Bookings',  icon: CalendarDaysIcon  },
];

const adminLinks = [
  { to: '/admin',       label: 'Admin Panel',  icon: ShieldCheckIcon   },
];

const NavLink = ({ to, label, icon: Icon, onClick }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-out
        ${active
          ? 'text-primary-300'
          : 'text-slate-400 hover:text-white'
        }`}
    >
      {/* Active state background with glow */}
      {active && (
        <span className="absolute inset-0 rounded-full bg-primary-500/10 border border-primary-500/20 shadow-[0_0_15px_rgba(79,70,229,0.15)] animate-fade-in" />
      )}
      {/* Hover state background */}
      <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
      
      <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="relative z-10">{label}</span>
    </Link>
  );
};

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminAuth = sessionStorage.getItem('scot_admin_auth') === 'true';

  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem('scot_admin_auth');
      await signOutUser();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch {
      toast.error('Sign-out failed. Please try again.');
    }
  };

  const links = [...navLinks];
  if (isAdmin || adminAuth) {
    links.push(...adminLinks);
  }

  const showSignOut = !!user || adminAuth;

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-black text-xl tracking-tighter">S</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-white text-base leading-tight tracking-wide group-hover:text-primary-300 transition-colors duration-300">
                SCOT CMS
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                Classroom Manager
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/[0.02] p-1.5 rounded-full border border-white/5 shadow-inner">
            {links.map(l => <NavLink key={l.to} {...l} />)}
          </div>

          {/* Enhanced User area */}
          <div className="flex items-center gap-2 sm:gap-4">
            {showSignOut && (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-white/10">
                {user ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-bold text-white leading-none mb-1">
                        {user.displayName || user.email.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">
                        {isAdmin ? 'Administrator' : 'Staff Member'}
                      </p>
                    </div>
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=4f46e5&color=fff&bold=true`}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-primary-500/30 hover:ring-primary-500 transition-all duration-300 shadow-lg object-cover"
                    />
                  </div>
                ) : (
                  <div className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wide shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                    Admin
                  </div>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-300 ml-1"
                  title="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 sm:p-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 border border-white/5"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Mobile drawer */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
          mobileOpen ? 'max-h-[400px] opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#0B0F19]/95 backdrop-blur-2xl px-4 py-6 space-y-2 shadow-2xl">
          {links.map(l => (
            <NavLink key={l.to} {...l} onClick={() => setMobileOpen(false)} />
          ))}
          {showSignOut && (
            <div className="pt-4 mt-2 border-t border-white/10">
              <button
                onClick={() => { setMobileOpen(false); handleSignOut(); }}
                className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Sign Out Securely
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
