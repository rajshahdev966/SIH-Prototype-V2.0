import React, { useState, useEffect } from 'react';
import {
  RiTwitterXFill,
  RiLinkedinFill,
  RiYoutubeFill,
  RiInstagramFill,
  RiFacebookFill,
  RiArrowLeftSLine,
  RiArrowRightSLine
} from '@remixicon/react';

// =========================================================================
// HERO ALTERNATING TITLES CONFIGURATION
// Add, edit, or reorder the titles that roll up automatically.
// =========================================================================
export const HERO_TITLES = [
  'Transforming government officials, Transforming India',
  'From Vision to Mission Mode for a Naya Bharat',
  "'Rule-based' to 'Role-based' governance",
  "'Karmachari' to a 'Karmayogi'",
  'Transforming & Empowering Civil Servants',
  'Competency-Driven Capacity Building of Officials'
];

// =========================================================================
// HERO CAROUSEL CONFIGURATION
// Replace the 'image' property with your image URLs or paths when ready.
// Example: image: '/images/hero-banner-1.png'
// If 'image' is empty or null, the fallback high-res graphic slide is shown.
// =========================================================================
export const HERO_CAROUSEL_SLIDES = [
  {
    id: 1,
    image: 'https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1785227909493_1-7cr.svg', // <-- Add your image 1 URL here
    alt: '1.7 Crore+ Users Onboarded Milestone',
    title: '1.7 Crore+ Users Onboarded',
    type: 'milestone'
  },
  {
    id: 2,
    image: 'https://igotkarmayogi.gov.in/assets/img/banner-e-2.webp', // <-- Add your image 2 URL here
    alt: 'Competency-Driven Capacity Building',
    title: 'Transforming Civil Service Governance',
    type: 'capacity'
  },
  {
    id: 3,
    image: 'https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1778248347196_Badges-Banner.png', // <-- Add your image 3 URL here
    alt: 'Amrit Gyaan Kosh Case Studies',
    title: 'Civil Services Knowledge Repository',
    type: 'gyaan'
  }
];

const HeroSection = ({ customSlides, customTitles }) => {
  const slides = customSlides && customSlides.length > 0 ? customSlides : HERO_CAROUSEL_SLIDES;
  const titles = customTitles && customTitles.length > 0 ? customTitles : HERO_TITLES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Roll-up alternating titles state
  const [titleIndex, setTitleIndex] = useState(0);
  const [prevTitleIndex, setPrevTitleIndex] = useState(null);

  // Auto roll-up animation timer for the alternating titles (every 3.6 seconds)
  useEffect(() => {
    if (titles.length <= 1) return;
    const interval = setInterval(() => {
      setTitleIndex((current) => {
        setPrevTitleIndex(current);
        return (current + 1) % titles.length;
      });
    }, 3600);
    return () => clearInterval(interval);
  }, [titles.length]);

  // Auto-play timer for carousel (transitions every 5 seconds, pauses when hovered)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="bg-[#FCE3CB] border-b border-orange-200/50 py-10 sm:py-14 px-4 sm:px-6 lg:px-12 transition-colors">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ========================================================= */}
        {/* Left Column: Official Branding & Follow Us (from screenshot) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-5 select-none">
          {/* Top Label */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#2D3748] tracking-tight">
              iGOT Karmayogi
            </h2>
          </div>

          {/* Main Roll-up Alternating Titles */}
          <div className="relative h-[95px] sm:h-[110px] lg:h-[125px] overflow-hidden">
            {prevTitleIndex !== null && (
              <div
                key={`prev-${prevTitleIndex}-${titleIndex}`}
                className="absolute inset-0 flex items-center animate-roll-up-out pointer-events-none"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-black text-[#ED7226] leading-[1.18] tracking-tight font-sans">
                  {titles[prevTitleIndex]}
                </h1>
              </div>
            )}
            <div
              key={`curr-${titleIndex}`}
              className={`absolute inset-0 flex items-center ${
                prevTitleIndex !== null ? 'animate-roll-up-in' : ''
              }`}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-black text-[#ED7226] leading-[1.18] tracking-tight font-sans">
                {titles[titleIndex]}
              </h1>
            </div>
          </div>

          {/* Social Follow Us Section */}
          <div className="pt-2">
            <p className="text-xs font-bold text-[#2D3748] mb-3">
              Follow Us
            </p>
            <div className="flex items-center gap-2.5">
              {[
                { name: 'X', icon: RiTwitterXFill, link: 'https://twitter.com/iGOTKarmayogi' },
                { name: 'LinkedIn', icon: RiLinkedinFill, link: 'https://www.linkedin.com/company/igot-karmayogi-bharat' },
                { name: 'YouTube', icon: RiYoutubeFill, link: 'https://www.youtube.com/@iGOTKarmayogi' },
                { name: 'Instagram', icon: RiInstagramFill, link: 'https://www.instagram.com/igotkarmayogi' },
                { name: 'Facebook', icon: RiFacebookFill, link: 'https://www.facebook.com/iGOTKarmayogi' }
              ].map((s) => {
                const IconComponent = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-[#0B5C9E] hover:bg-[#0A4D85] text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 active:scale-95"
                    title={s.name}
                  >
                    <IconComponent size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Right Column: Hero Carousel with Decorative Diagonal Pills */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div
            className="relative w-full max-w-[660px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Top-Left Decorative Navy Blue Diagonal Pill */}
            <div
              className="absolute -top-3.5 -left-3.5 w-6 sm:w-7 h-16 sm:h-20 bg-[#0B5C9E] rounded-full -rotate-45 pointer-events-none z-0 shadow-xs"
              aria-hidden="true"
            />

            {/* Bottom-Right Decorative Orange Diagonal Pill */}
            <div
              className="absolute -bottom-3.5 -right-3.5 w-6 sm:w-7 h-16 sm:h-20 bg-[#ED7226] rounded-full -rotate-45 pointer-events-none z-0 shadow-xs"
              aria-hidden="true"
            />

            {/* Carousel Outer Frame (Thick White Border with Rounded Corners) */}
            <div className="relative z-10 bg-white rounded-2xl border-[6px] border-white shadow-xl overflow-hidden aspect-[16/9] select-none group">
              {slides.map((slide, index) => {
                const isActive = index === currentIndex;
                return (
                  <div
                    key={slide.id || index}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {slide.image ? (
                      /* User Uploaded / Custom Image */
                      <img
                        src={slide.image}
                        alt={slide.alt || `Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      /* Built-in Authentic Graphic Slides */
                      <RenderFallbackSlide type={slide.type} />
                    )}
                  </div>
                );
              })}

              {/* Prev / Next Chevrons (visible on hover) */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous Slide"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <RiArrowLeftSLine size={20} />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next Slide"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <RiArrowRightSLine size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Carousel Bottom Indicator Dots (as shown in screenshot) */}
            <div className="flex items-center justify-center gap-1.5 mt-3 select-none">
              {slides.map((_, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-4 h-[3px] bg-[#ED7226] rounded-full'
                        : 'w-[3px] h-[3px] bg-slate-500 rounded-full hover:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// =========================================================================
// AUTHENTIC GRAPHIC SLIDE RENDERER (Used until user uploads custom images)
// =========================================================================
function RenderFallbackSlide({ type }) {
  if (type === 'capacity') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#0B5C9E] via-[#0A4D85] to-[#062E52] text-white flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden">
        {/* Background Sovereign Mandala */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 400 400" className="w-[500px] h-[500px]" fill="none" stroke="#FFFFFF" strokeWidth="1.5">
            <circle cx="200" cy="200" r="160" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="120" />
            <circle cx="200" cy="200" r="80" strokeDasharray="6 3" />
            <path d="M40 200 Q200 40 360 200 Q200 360 40 200 Z" />
            <path d="M200 40 Q360 200 200 360 Q40 200 200 40 Z" />
          </svg>
        </div>

        {/* Badge */}
        <div className="relative z-10 flex justify-center">
          <span className="bg-[#ED7226] text-white text-xs sm:text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Civil Service Reform
          </span>
        </div>

        {/* Core Message */}
        <div className="relative z-10 text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Competency-Driven Capacity Building
          </h3>
          <p className="text-blue-100 text-xs sm:text-sm max-w-md mx-auto">
            Democratizing continuous professional education for every government official across the nation.
          </p>
        </div>

        {/* Footer Subtext */}
        <div className="relative z-10 text-center">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-widest border-t border-white/20 pt-2 inline-block px-6">
            Mission Karmayogi Bharat
          </p>
        </div>
      </div>
    );
  }

  if (type === 'gyaan') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#1B365D] via-[#0B5C9E] to-[#E97125]/80 text-white flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden">
        {/* Badge */}
        <div className="relative z-10 flex justify-center">
          <span className="bg-amber-400 text-slate-950 text-xs sm:text-sm font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Amrit Gyaan Kosh
          </span>
        </div>

        {/* Core Message */}
        <div className="relative z-10 text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Governance Innovation Case Studies
          </h3>
          <p className="text-blue-100 text-xs sm:text-sm max-w-md mx-auto">
            Practical insights and breakthrough administrative turnarounds from across Indian civil services.
          </p>
        </div>

        {/* Footer Subtext */}
        <div className="relative z-10 text-center">
          <p className="text-xs font-bold text-white border-b border-white pb-0.5 inline-block">
            Learn from authentic field leadership
          </p>
        </div>
      </div>
    );
  }

  // Default: Exact replication of "1.7 Crore+ Users Onboarded" from user screenshot
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#E68A2E] via-[#0B5C9E] to-[#084277] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Golden Confetti / Ribbons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Confetti particles */}
        <div className="absolute top-2 left-4 w-3 h-1.5 bg-amber-300 rotate-45 rounded-xs" />
        <div className="absolute top-6 left-12 w-2 h-2 bg-amber-200 -rotate-12 rounded-xs" />
        <div className="absolute top-10 left-20 w-3 h-1 bg-amber-400 rotate-12" />
        <div className="absolute top-3 right-6 w-2.5 h-2 bg-amber-300 -rotate-45" />
        <div className="absolute top-8 right-16 w-3 h-1 bg-amber-200 rotate-30" />
        <div className="absolute top-14 right-28 w-2 h-2.5 bg-amber-400 rotate-15" />
        <div className="absolute top-16 left-6 w-2.5 h-1.5 bg-amber-300 -rotate-30" />
        <div className="absolute top-20 right-8 w-3 h-2 bg-amber-300 rotate-45" />

        {/* Lotus wave lines in the blue base */}
        <svg viewBox="0 0 600 300" className="absolute bottom-0 inset-x-0 w-full h-[70%] opacity-25" fill="none" stroke="#FFFFFF" strokeWidth="2">
          <path d="M0 250 Q150 120 300 250 T600 250" />
          <path d="M0 270 Q150 160 300 270 T600 270" />
          <path d="M0 290 Q150 200 300 290 T600 290" />
          <path d="M150 300 Q300 150 450 300" />
        </svg>
      </div>

      {/* Arched Top Badge: "Congratulations, Karmayogis!" */}
      <div className="relative z-10 flex justify-center pt-1">
        <div className="bg-[#ED7226] border border-white/40 text-white font-bold text-[11px] sm:text-xs md:text-sm px-4 sm:px-6 py-0.5 sm:py-1 rounded-full shadow-md">
          Congratulations, Karmayogis!
        </div>
      </div>

      {/* Central Big Metric: "1.7 Crore+ Users Onboarded" */}
      <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4 my-auto">
        {/* Giant 1.7 */}
        <span className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-none font-sans drop-shadow-md">
          1.7
        </span>

        {/* Stacked "Crore+" and "Users Onboarded" in Gold */}
        <div className="flex flex-col justify-center text-left">
          <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FFBE1A] tracking-tight leading-tight drop-shadow-sm">
            Crore+
          </span>
          <span className="text-base sm:text-xl md:text-2xl font-bold text-[#FFBE1A] tracking-tight leading-tight drop-shadow-sm">
            Users Onboarded
          </span>
        </div>
      </div>

      {/* Bottom Slogan with Underline */}
      <div className="relative z-10 text-center pb-1 sm:pb-2">
        <div className="inline-block border-b-2 border-white/80 pb-0.5">
          <p className="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide">
            Let's continue to learn, grow and lead!
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
