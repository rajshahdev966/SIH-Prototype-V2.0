import React from 'react';
import { RiLogoutBoxRLine, RiBarChart2Line } from '@remixicon/react';

const Navbar = ({
  currentUser,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  onViewGrowth,
  currentView,
  onGoHome
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Karmayogi Bharat Official Emblem & Logo */}
        <div className="flex items-center gap-4 cursor-pointer select-none" onClick={onGoHome}>
          <div className="flex items-center gap-3">
            {/* National Lotus Emblem SVG */}
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                <path d="M50 15 C45 35 25 45 15 50 C25 55 45 65 50 85 C55 65 75 55 85 50 C75 45 55 35 50 15 Z" fill="#F37023" />
                <path d="M50 25 C47 40 32 48 25 50 C32 52 47 60 50 75 C53 60 68 52 75 50 C68 48 53 40 50 25 Z" fill="#0B5C9E" />
                <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
                <circle cx="50" cy="50" r="6" fill="#F37023" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-[#F37023] tracking-tight font-hindi">
                  कर्मयोगी
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#0B5C9E] tracking-tight font-hindi">
                  भारत
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase font-hindi">
                — लोकहितं मम करणीयम् —
              </p>
            </div>
          </div>
        </div>

        {/* Official Navigation Links (Desktop) */}
        {/* ///////////////////////////////////////////////////// */}

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onViewGrowth}
                className={
                  'text-xs font-bold px-4 py-2 rounded-full transition-all border flex items-center gap-1.5 ' +
                  (currentView === 'growth'
                    ? 'bg-[#0B5C9E] text-white border-[#0B5C9E] shadow-sm'
                    : 'bg-blue-50 text-[#0B5C9E] border-blue-200 hover:bg-blue-100')
                }
              >
                <RiBarChart2Line size={15} />
                <span>My Growth Analytics</span>
              </button>

              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B5C9E] to-[#072C68] text-white font-bold flex items-center justify-center text-sm shadow-xs ring-2 ring-blue-100 shrink-0">
                  {currentUser.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {currentUser.name || 'Civil Servant'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate max-w-[160px] hidden sm:block">
                    {currentUser.email || currentUser.phone || 'Government Officer'}
                  </p>
                </div>
                <button
                  onClick={onLogoutClick}
                  className="text-xs text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
                  title="Sign Out"
                >
                  <RiLogoutBoxRLine />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onLoginClick}
                className="text-xs sm:text-sm font-semibold text-[#0B5C9E] border border-[#0B5C9E] hover:bg-blue-50/80 px-5 py-2 rounded-full transition-all cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={onRegisterClick}
                className="text-xs sm:text-sm font-semibold text-white bg-[#F37023] hover:bg-[#D95B12] px-5 py-2 rounded-full transition-all shadow-xs hover:shadow-sm cursor-pointer"
              >
                Register
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;
