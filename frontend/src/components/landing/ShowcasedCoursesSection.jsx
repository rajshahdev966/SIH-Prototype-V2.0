import React, { useState } from 'react';

const ShowcasedCoursesSection = ({ courses = [], onReadSummary, onTakeQuiz, currentUser, onRequireAuth }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAction = (type, courseId) => {
    if (!currentUser) {
      onRequireAuth({ action: type, courseId });
      return;
    }
    if (type === 'reader') {
      onReadSummary(courseId);
    } else {
      onTakeQuiz(courseId);
    }
  };

  const handleNext = () => {
    if (courses.length <= 4) return;
    setCurrentIndex((prev) => (prev + 1) % (courses.length - 3));
  };

  const handlePrev = () => {
    if (courses.length <= 4) return;
    setCurrentIndex((prev) => (prev - 1 + (courses.length - 3)) % (courses.length - 3));
  };

  // Determine the slice of courses to display
  const displayedCourses = courses.length > 4
    ? courses.slice(currentIndex, currentIndex + 4)
    : courses;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      <div className="bg-[#FDF5EC] border border-orange-200/60 rounded-3xl p-6 sm:p-10 relative">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#F37023] text-xs font-bold uppercase tracking-wider mb-2">
              <span>●</span> In Sync with Admin Repository
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Showcased Courses
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Curated official capacity building modules active in the national governance database
            </p>
          </div>
          <button
            onClick={() => handleAction('catalog', null)}
            className="text-xs sm:text-sm font-bold text-[#0B5C9E] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>Show all ({courses.length})</span>
            <span>&gt;</span>
          </button>
        </div>

        {/* Carousel Navigation Arrows - only shown if more than 4 courses */}
        {courses.length > 4 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black shadow-md z-10 cursor-pointer text-lg font-bold"
              title="Previous Courses"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black shadow-md z-10 cursor-pointer text-lg font-bold"
              title="Next Courses"
            >
              ›
            </button>
          </>
        )}

        {/* Empty State if no courses in Admin Portal / DB */}
        {(!courses || courses.length === 0) ? (
          <div className="bg-white rounded-2xl border border-dashed border-orange-300 p-12 text-center max-w-lg mx-auto">
            <span className="text-4xl block mb-3">📚</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No Courses Added Yet
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Courses added and published through the Admin Portal will automatically appear here in real time.
            </p>
            <button
              onClick={() => handleAction('catalog', null)}
              className="px-5 py-2.5 rounded-xl bg-[#0B5C9E] text-white text-xs font-bold hover:bg-[#0A387E] transition-colors cursor-pointer shadow-xs"
            >
              Explore Course Catalog
            </button>
          </div>
        ) : (
          /* Course Cards Grid */
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${
            displayedCourses.length === 1
              ? 'max-w-md mx-auto'
              : displayedCourses.length === 2
                ? 'lg:grid-cols-2 max-w-3xl mx-auto'
                : displayedCourses.length === 3
                  ? 'lg:grid-cols-3'
                  : 'lg:grid-cols-4'
          } gap-6`}>
            {displayedCourses.map((course) => (
              <div
                key={course.courseId}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Thumbnail Container with Category & Duration Badge */}
                <div className="relative h-44 bg-gradient-to-br from-blue-900 via-[#0B5C9E] to-indigo-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <span className="text-3xl mb-1">📜</span>
                  <span className="text-xs font-bold text-blue-100 uppercase tracking-wider line-clamp-1 relative z-10">
                    {course.category || 'Course'}
                  </span>
                  <h4 className="text-sm font-bold text-white relative z-10 px-2 line-clamp-2 mt-1">
                    {course.title}
                  </h4>

                  {/* Duration Overlay Pill */}
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                    <span>⏱️</span>
                    <span>{course.duration || (course.mcqCount ? `${course.mcqCount * 2}m` : '30m')}</span>
                  </div>

                  {/* Assessment count pill */}
                  {course.mcqCount > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {course.mcqCount} MCQs
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#F37023] bg-[#FFF3EB] border border-[#F37023]/30 uppercase tracking-wide">
                        {course.category || 'Course'}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Verified
                      </span>
                    </div>

                    <h3
                      className="text-sm font-bold text-slate-900 group-hover:text-[#0B5C9E] transition-colors line-clamp-2 leading-snug"
                      title={course.title}
                    >
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5 line-clamp-1">
                      <span>🏛️</span>
                      <span className="truncate">By {course.author || 'Karmayogi Bharat'}</span>
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleAction('reader', course.courseId)}
                      className="flex-1 text-xs font-semibold py-2 px-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center cursor-pointer"
                    >
                      Summary
                    </button>
                    <button
                      onClick={() => handleAction('quiz', course.courseId)}
                      className="flex-1 text-xs font-bold py-2 px-2.5 bg-[#0B5C9E] hover:bg-[#0A387E] text-white rounded-lg transition-colors text-center cursor-pointer shadow-xs"
                    >
                      Take Test →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShowcasedCoursesSection;
