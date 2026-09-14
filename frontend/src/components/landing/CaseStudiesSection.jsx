import React, { useState } from 'react';

const CaseStudiesSection = ({ caseStudies = [], currentUser, onRequireAuth }) => {
  const [activeModalCase, setActiveModalCase] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpenCase = (cs) => {
    if (!currentUser) {
      onRequireAuth({ action: 'case-study', item: cs });
      return;
    }
    setActiveModalCase(cs);
  };

  const handleNext = () => {
    if (caseStudies.length <= 4) return;
    setCurrentIndex((prev) => (prev + 1) % (caseStudies.length - 3));
  };

  const handlePrev = () => {
    if (caseStudies.length <= 4) return;
    setCurrentIndex((prev) => (prev - 1 + (caseStudies.length - 3)) % (caseStudies.length - 3));
  };

  const displayedCases = caseStudies.length > 4
    ? caseStudies.slice(currentIndex, currentIndex + 4)
    : caseStudies;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      <div className="bg-[#FDF5EC] border border-orange-200/60 rounded-3xl p-6 sm:p-10 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#F37023] text-xs font-bold uppercase tracking-wider mb-2">
              <span>●</span> In Sync with Admin Repository
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Amrit Gyaan Kosh Case Studies
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Real-world administrative case studies highlighting governance innovations across India
            </p>
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#0B5C9E] hover:underline cursor-pointer flex items-center gap-1 shrink-0">
            <span>Show all ({caseStudies.length})</span>
            <span>&gt;</span>
          </span>
        </div>

        {/* Carousel Navigation Arrows if > 4 */}
        {caseStudies.length > 4 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black shadow-md z-10 cursor-pointer text-lg font-bold"
              title="Previous Case Studies"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black shadow-md z-10 cursor-pointer text-lg font-bold"
              title="Next Case Studies"
            >
              ›
            </button>
          </>
        )}

        {/* Empty State */}
        {(!caseStudies || caseStudies.length === 0) ? (
          <div className="bg-white rounded-2xl border border-dashed border-orange-300 p-12 text-center max-w-lg mx-auto">
            <span className="text-4xl block mb-3">🏛️</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No Case Studies Published Yet
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Governance case studies added and published through the Admin Portal will automatically appear here in real time.
            </p>
          </div>
        ) : (
          /* Case Study Cards Grid */
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${
            displayedCases.length === 1
              ? 'max-w-md mx-auto'
              : displayedCases.length === 2
                ? 'lg:grid-cols-2 max-w-3xl mx-auto'
                : displayedCases.length === 3
                  ? 'lg:grid-cols-3'
                  : 'lg:grid-cols-4'
          } gap-6`}>
            {displayedCases.map((cs) => (
              <div
                key={cs.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Thumbnail Container with Duration Badge */}
                <div className="relative h-44 bg-gradient-to-br from-amber-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                  <span className="text-3xl mb-1">🏛️</span>
                  <span className="text-xs font-bold text-amber-200 uppercase tracking-wider line-clamp-1 relative z-10">
                    Governance Case Study
                  </span>
                  <h4 className="text-xs font-bold text-white relative z-10 px-2 line-clamp-2 mt-1">
                    {cs.title}
                  </h4>

                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                    <span>⏱️</span>
                    <span>{cs.duration || '1h'}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Categories */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {(cs.categories || ['Governance']).map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <h3
                      className="text-sm font-bold text-slate-900 group-hover:text-[#0B5C9E] transition-colors line-clamp-2 leading-snug"
                      title={cs.title}
                    >
                      {cs.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5 line-clamp-1">
                      <span>✍️</span>
                      <span className="truncate">By {cs.author || 'Capacity Building Commission'}</span>
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenCase(cs)}
                      className="w-full text-xs font-bold py-2.5 px-3 bg-[#0B5C9E] hover:bg-[#0A387E] text-white rounded-lg transition-colors text-center cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Read Case Study</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Case Study Modal (when logged in) */}
      {activeModalCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#F37023] uppercase tracking-wide">
                  Amrit Gyaan Kosh Repository
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {activeModalCase.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalCase(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pb-2 border-b border-slate-100">
              <span>⏱️ Estimated Reading: {activeModalCase.duration || '1h'}</span>
              <span>🏛️ By {activeModalCase.author || 'Capacity Building Commission'}</span>
            </div>

            <div className="space-y-3 text-sm text-slate-700 leading-relaxed max-h-96 overflow-y-auto pr-2">
              <p className="font-semibold text-slate-800">
                Executive Overview:
              </p>
              <p>
                {activeModalCase.summary}
              </p>
              
              {/* Key Lessons from DB */}
              {activeModalCase.lessons && activeModalCase.lessons.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 mt-4">
                  <span className="text-xs font-bold text-[#0B5C9E] uppercase tracking-wide block">
                    Key Governance Lessons
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    {activeModalCase.lessons.map((lesson, idx) => (
                      <li key={idx}>{lesson}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveModalCase(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CaseStudiesSection;
