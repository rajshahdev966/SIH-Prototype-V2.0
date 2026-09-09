import React from 'react';

const CourseCatalog = ({ courses, onReadSummary, onTakeQuiz, onViewCourseHistory, onSwitchToAdmin }) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
            Official Course Repository
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            iGOT Civil Service Learning Portal
          </h2>
          <p className="text-sm text-blue-100 mt-1.5 max-w-xl leading-relaxed">
            Access verified governance modules, study structured knowledge bases, and test your competency with dynamic AI-evaluated assessments.
          </p>
        </div>
        <div className="shrink-0 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/20 text-center min-w-36">
          <span className="block text-2xl font-black text-white">{courses?.length || 0}</span>
          <span className="text-xs text-blue-200 font-medium">Published Modules</span>
        </div>
      </div>

      {(!courses || courses.length === 0) ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
            📚
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Courses Published Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Courses are ingested and verified through the Admin Panel using the Browser Extraction and MCQ Generation Agents.
          </p>
          {onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Open Admin Hub to Ingest Course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.courseId}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified Course
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {course.courseId.length > 16 ? `${course.courseId.slice(0, 16)}...` : course.courseId}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-600 transition-colors line-clamp-2" title={course.title}>
                  {course.title}
                </h3>

                <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-600">
                  <div className="bg-gray-50 p-2.5 rounded-xl">
                    <span className="block text-gray-400 font-medium text-[11px]">Assessment</span>
                    <span className="text-sm font-bold text-gray-800">{course.mcqCount || 15} MCQs</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl">
                    <span className="block text-gray-400 font-medium text-[11px]">Submissions</span>
                    <span className="text-sm font-bold text-blue-600">{course.submissionCount || 0} Attempts</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onReadSummary(course.courseId)}
                  className="text-xs text-gray-700 hover:text-blue-600 font-semibold py-2 px-3 rounded-lg hover:bg-white border border-gray-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📖</span>
                  <span>Read Summary</span>
                </button>
                <button
                  onClick={() => onTakeQuiz(course.courseId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Take Quiz →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
