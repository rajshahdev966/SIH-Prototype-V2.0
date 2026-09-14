import React, { useState } from 'react';
import {
  RiGraduationCapLine,
  RiBriefcaseLine,
  RiCalendarEventLine,
  RiPuzzleLine,
  RiTeamLine,
  RiChat1Line,
  RiGovernmentLine,
  RiComputerLine,
  RiLineChartLine,
  RiUserStarLine,
  RiFlowerLine
} from '@remixicon/react';

const LandingExtras = () => {
  const [videoTab, setVideoTab] = useState('how-to');

  return (
    <div className="space-y-16 pb-12">
      
      {/* =========================================================================
          1. VIDEO GALLERY
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Video Gallery
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Video orientations, platform walkthroughs, and national leadership talks
          </p>

          <div className="flex justify-center gap-6 mt-6 border-b border-slate-200 text-sm font-bold">
            <button
              onClick={() => setVideoTab('how-to')}
              className={`pb-3 transition-colors cursor-pointer ${
                videoTab === 'how-to'
                  ? 'border-b-2 border-[#0B5C9E] text-[#0B5C9E]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              How to Videos
            </button>
            <button
              onClick={() => setVideoTab('preview')}
              className={`pb-3 transition-colors cursor-pointer ${
                videoTab === 'preview'
                  ? 'border-b-2 border-[#0B5C9E] text-[#0B5C9E]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Course Preview
            </button>
            <button
              onClick={() => setVideoTab('talks')}
              className={`pb-3 transition-colors cursor-pointer ${
                videoTab === 'talks'
                  ? 'border-b-2 border-[#0B5C9E] text-[#0B5C9E]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Karmayogi Talks
            </button>
          </div>
        </div>

        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden group">
          <div className="h-64 bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center relative">
            <div className="w-16 h-16 rounded-full bg-[#F37023] text-white flex items-center justify-center text-2xl shadow-lg pl-1 cursor-pointer group-hover:scale-110 transition-transform">
              ▶
            </div>
            <h4 className="text-base font-bold text-white mt-4 max-w-md">
              How to integrate iGOT Karmayogi Training Data into SPARROW APAR
            </h4>
            <span className="text-xs text-blue-200 mt-1">Department of Personnel & Training (DoPT)</span>
          </div>
          <div className="bg-[#0B5C9E] px-6 py-3.5 flex items-center justify-between text-white font-bold text-sm">
            <span>How to Video</span>
            <span className="text-xs bg-white/20 w-6 h-6 rounded-full flex items-center justify-center">▶</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. KARMAYOGI HUBS (Radial Diagram)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Karmayogi Hubs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Integrated ecosystem uniting learners, competencies, ministries, and assessments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive Radial Graph */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-orange-50/50 via-white to-blue-50/50 border border-orange-200/60 p-8 flex items-center justify-center shadow-inner">
              {/* Central Glowing Emblem */}
              <div className="w-24 h-24 rounded-full bg-white shadow-lg border-2 border-orange-300 flex flex-col items-center justify-center p-2 text-center z-10">
                <RiFlowerLine className="text-[#F37023] mb-0.5" size={26} />
                <span className="text-[10px] font-black text-[#F37023] font-hindi">कर्मयोगी</span>
              </div>

              {/* Orbiting Satellite Nodes */}
              {[
                { icon: RiGraduationCapLine, label: 'Competency', pos: 'top-3 left-1/2 -translate-x-1/2' },
                { icon: RiBriefcaseLine, label: 'Careers', pos: 'top-16 left-6' },
                { icon: RiCalendarEventLine, label: 'Events', pos: 'top-16 right-6' },
                { icon: RiPuzzleLine, label: 'Modules', pos: 'bottom-16 left-6' },
                { icon: RiTeamLine, label: 'Network', pos: 'bottom-16 right-6' },
                { icon: RiChat1Line, label: 'Discussions', pos: 'bottom-3 left-1/2 -translate-x-1/2' }
              ].map((n) => {
                const IconComp = n.icon;
                return (
                  <div
                    key={n.label}
                    className={`absolute ${n.pos} w-11 h-11 rounded-full bg-white shadow-md border border-blue-200 flex items-center justify-center text-sm font-bold text-[#0B5C9E] hover:scale-110 transition-transform cursor-pointer`}
                    title={n.label}
                  >
                    <IconComp size={18} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Hub Highlights & Action Cards */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B5C9E] flex items-center justify-center">
                  <RiTeamLine size={22} />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Network Hub</h4>
                  <p className="text-xs text-slate-500">Connect and collaborate with peers across Ministries, Departments, Organisations</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-2">
                <span className="w-5 h-1.5 bg-[#0B5C9E] rounded-full" />
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-2xl border border-orange-200 overflow-hidden">
                <div className="p-5 text-center">
                  <span className="text-xs font-bold text-amber-900">How to</span>
                  <h5 className="text-sm font-black text-slate-900 mt-1">Register & Login at the iGOT Karmayogi Platform?</h5>
                </div>
                <div className="bg-[#0B5C9E] px-4 py-2.5 flex items-center justify-between text-white text-xs font-bold">
                  <span>How to Login and Register ?</span>
                  <span>▶</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100/50 rounded-2xl border border-blue-200 overflow-hidden">
                <div className="p-5 text-center">
                  <span className="text-xs font-bold text-blue-900">Official</span>
                  <h5 className="text-sm font-black text-slate-900 mt-1">iGOT Karmayogi Bharat Platform Walkthrough</h5>
                </div>
                <div className="bg-[#0B5C9E] px-4 py-2.5 flex items-center justify-between text-white text-xs font-bold">
                  <span>iGOT Walkthrough</span>
                  <span>▶</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SOCIAL HUB
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Social Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Stay updated with live announcements, capacity building drives, and official circulars
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LinkedIn Feed Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="bg-[#0077B5] px-6 py-3 text-white font-bold text-sm flex items-center gap-2">
              <span>in</span>
              <span>LinkedIn Official Feed</span>
            </div>
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0077B5] flex items-center justify-center mx-auto text-xl font-black">
                in
              </div>
              <h5 className="text-sm font-bold text-slate-800">Karmayogi Bharat on LinkedIn</h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore leadership speeches, capacity building milestones, and success stories from civil servants across India.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-bold text-[#0077B5] border border-[#0077B5] hover:bg-blue-50 px-6 py-2 rounded-full transition-colors"
              >
                Follow Us
              </a>
            </div>
          </div>

          {/* X Feed Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="bg-[#0F1419] px-6 py-3 text-white font-bold text-sm flex items-center gap-2">
              <span>𝕏</span>
              <span>X (Twitter) Official Feed</span>
            </div>
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center mx-auto text-xl font-black">
                𝕏
              </div>
              <h5 className="text-sm font-bold text-slate-800">@iGOTKarmayogi on X</h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Real-time updates on national workshops, webinars, and competency assessments.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-bold text-slate-800 border border-slate-800 hover:bg-slate-100 px-6 py-2 rounded-full transition-colors"
              >
                Follow Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. NEWSROOM & PHOTO GALLERY
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Newsroom
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Press Information Bureau (PIB) releases and official capacity building bulletins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#0B5C9E] to-blue-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  PIB Report
                </span>
                <h4 className="text-base font-bold mt-4 leading-snug">
                  Rozgar Mela on 12th February 2024: New recruits oriented on iGOT Karmayogi
                </h4>
              </div>
              <span className="text-xs text-blue-200 mt-6 font-mono">12 Feb 2024 • New Delhi</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0B5C9E] flex items-center justify-center font-black text-2xl mb-3">
                pib
              </div>
              <h4 className="text-base font-extrabold text-slate-900">PIB Report</h4>
              <p className="text-xs text-slate-500 mt-1">National Media Centre Bulletin</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-[#F37023] text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                  PIB Report
                </span>
                <h4 className="text-base font-black mt-4 leading-snug">
                  'DAKSHTA' For Young Professionals now Live at iGOT Karmayogi
                </h4>
              </div>
              <span className="text-xs text-amber-100 mt-6 font-mono">Special Capacity Drive</span>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div>
          <div className="text-center mb-6">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Photo Gallery
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Conference Hall', icon: RiGovernmentLine },
              { label: 'Officer Cohort', icon: RiTeamLine },
              { label: 'Computer Assessment Lab', icon: RiComputerLine },
              { label: 'Executive Boardroom', icon: RiLineChartLine }
            ].map((img, i) => {
              const IconComp = img.icon;
              return (
                <div
                  key={i}
                  className="h-36 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-2xl flex flex-col items-center justify-center text-white p-3 text-center shadow-xs group hover:from-slate-700 hover:to-slate-600 transition-all"
                >
                  <IconComp size={36} className="text-blue-300 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-200">{img.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. TESTIMONIALS CAROUSEL
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Testimonials
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Experiences from distinguished officers and civil servants
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0B5C9E] via-[#09487D] to-slate-900 text-white rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-7 p-8 sm:p-10 space-y-4">
            <span className="text-3xl font-serif text-amber-300">“</span>
            <p className="text-sm sm:text-base text-blue-50 leading-relaxed italic">
              iGOT Karmayogi has completely revitalized the way our officers approach competency upgrades. The role-based training modules allow our teams to solve practical administrative challenges in real-time.
            </p>
            <div className="pt-4 border-t border-white/15">
              <h5 className="text-base font-extrabold text-white">A. Dhanalakshmi</h5>
              <p className="text-xs text-amber-300 font-medium">Joint Secretary</p>
              <p className="text-xs text-blue-200">Department of Science & Technology</p>
            </div>
          </div>
          <div className="md:col-span-5 h-64 md:h-full bg-gradient-to-tr from-slate-800 to-indigo-950 flex flex-col items-center justify-center p-6 text-center border-l border-white/10">
            <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white mb-3 shadow-inner">
              <RiUserStarLine size={44} />
            </div>
            <span className="text-xs font-bold text-blue-200">Joint Secretary</span>
            <span className="text-[11px] text-blue-300">Govt. of India</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CONTENT PARTNERS
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Content Partners
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Premier national academies and research institutions contributing curriculum
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center items-center">
          {[
            { acronym: 'DPIIT', name: 'Dept. for Promotion of Industry & Internal Trade' },
            { acronym: 'RAKNPA', name: 'Rafi Ahmed Kidwai National Postal Academy' },
            { acronym: 'WF', name: 'Wadhwani Foundation' },
            { acronym: 'ISB', name: 'Indian School of Business' },
            { acronym: 'LBSNAA', name: 'Lal Bahadur Shastri National Academy of Administration' },
            { acronym: 'MoEFCC', name: 'Ministry of Environment, Forest & Climate Change' },
            { acronym: 'ISTM', name: 'Institute of Secretariat Training and Management' }
          ].map((partner) => (
            <div
              key={partner.acronym}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center justify-center min-h-[90px]"
            >
              <span className="font-extrabold text-sm text-[#0B5C9E] tracking-tight">{partner.acronym}</span>
              <span className="text-[9px] text-slate-500 line-clamp-2 mt-1 leading-tight">{partner.name}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingExtras;
