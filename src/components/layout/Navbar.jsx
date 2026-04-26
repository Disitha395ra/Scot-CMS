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
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
        ${active
          ? 'bg-primary-600/30 text-primary-300 border border-primary-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/8'
        }`}
    >
      <Icon className="w-4.5 h-4.5" />
      {label}
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
    <nav className="sticky top-0 z-40 bg-surface-900/90 backdrop-blur-xl border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-bold text-white text-sm leading-tight hidden sm:block">
              Scot CMS
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => <NavLink key={l.to} {...l} />)}
          </div>

          {/* User area */}
          <div className="flex items-center gap-3">
            {showSignOut && (
              <>
                {user ? (
                  <>
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=4f46e5&color=fff`}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full ring-2 ring-primary-500/40 hidden sm:block"
                    />
                    <span className="text-xs text-slate-400 hidden lg:block max-w-[160px] truncate">
                      {user.displayName || user.email}
                    </span>
                  </>
                ) : (
                  <div className="badge bg-accent-500/20 text-accent-400 border border-accent-500/30 hidden sm:block">
                    Admin Mode
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="btn-ghost btn-sm hidden md:flex"
                  title="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign out
                </button>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              className="btn-ghost btn-sm md:hidden p-2"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 bg-surface-900/95 animate-slide-up px-4 py-4 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} {...l} onClick={() => setMobileOpen(false)} />
          ))}
          {showSignOut && (
            <button
              onClick={() => { setMobileOpen(false); handleSignOut(); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
