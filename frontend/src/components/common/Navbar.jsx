import React from 'react';
import { RiLogoutBoxRLine, RiBarChart2Line } from '@remixicon/react';
import igotLogo from '../../assets/igotLogo.svg';

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
        {/* Karmayogi Bharat Official Logo */}
        <div className="flex items-center cursor-pointer select-none py-1" onClick={onGoHome}>
          <img
            src={igotLogo}
            alt="iGOT Karmayogi Bharat"
            className="h-12 sm:h-14 w-auto max-w-[240px] sm:max-w-[280px] object-contain"
          />
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
