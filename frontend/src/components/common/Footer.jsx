import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#F37023] font-hindi">कर्मयोगी</span>
              <span className="text-xl font-bold text-white font-hindi">भारत</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Karmayogi Bharat is a Special Purpose Vehicle (SPV) under the Department of Personnel and Training (DoPT), Government of India.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase tracking-wider text-xs">Government Links</h5>
            <ul className="space-y-1 text-slate-400">
              <li><a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white">National Portal of India</a></li>
              <li><a href="https://dopt.gov.in" target="_blank" rel="noreferrer" className="hover:text-white">DoPT Official Portal</a></li>
              <li><a href="https://cbc.gov.in" target="_blank" rel="noreferrer" className="hover:text-white">Capacity Building Commission</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase tracking-wider text-xs">Help & Compliance</h5>
            <ul className="space-y-1 text-slate-400">
              <li><span className="hover:text-white cursor-pointer">Website Policies</span></li>
              <li><span className="hover:text-white cursor-pointer">Help & Contact Us</span></li>
              <li><span className="hover:text-white cursor-pointer">Feedback & Grievances</span></li>
              <li><span className="hover:text-white cursor-pointer">Accessibility Statement</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase tracking-wider text-xs">Security & Platform</h5>
            <p className="text-slate-400 leading-relaxed">
              Protected by National Informatics Centre (NIC) and Parichay Single Sign-On standards. Certified GIGW 3.0 compliant.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <span>© {new Date().getFullYear()} Karmayogi Bharat, Government of India. All rights reserved.</span>
          <span>Smart India Hackathon • Longitudinal Competency & Growth Engine</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
