import React from 'react';
import { RiLinkedinFill, RiGithubFill, RiCodeSSlashLine } from '@remixicon/react';

const DeveloperFooter = () => {
  return (
    <footer className="w-full bg-[#051329] text-slate-400 py-3 px-4 sm:px-8 border-t border-slate-800/80 font-sans select-none z-40">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        
        {/* Creator Identity & Attribution */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0B5C9E]/30 border border-[#0B5C9E]/50 text-[#60A5FA] text-[10px] font-bold uppercase tracking-wider">
              <RiCodeSSlashLine size={12} />
              Lead Developer
            </span>
            <span className="text-xs font-semibold text-slate-200">
              This product is developed by <strong className="text-white font-bold underline decoration-[#F37023] decoration-2 underline-offset-2">Raj Shah</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 font-medium">
              Full Stack Web Developer
            </span>
          </div>
          
          {/* Contribution Notice */}
          <p className="text-[10px] text-slate-400 font-normal leading-tight italic text-wrap">
            Development and technical implementation of this prototype were led and carried out by Raj Shah, with the project developed as part of our team participation in Smart India Hackathon.
          </p>
        </div>

        {/* Social Profile Links */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="https://www.linkedin.com/in/rajshah-dev/"
            target="_blank" 
            rel="noopener noreferrer"
            title="Raj Shah on LinkedIn (Click to view profile)"
            aria-label="Raj Shah LinkedIn Profile"
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-[#0A66C2] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105 border border-slate-700"
          >
            <RiLinkedinFill size={14} />
          </a>
          <a
            href="https://github.com/rajshahdev966"
            target="_blank"
            rel="noopener noreferrer"
            title="Raj Shah on GitHub (Click to view profile)"
            aria-label="Raj Shah GitHub Profile"
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105 border border-slate-700"
          >
            <RiGithubFill size={14} />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default DeveloperFooter;
