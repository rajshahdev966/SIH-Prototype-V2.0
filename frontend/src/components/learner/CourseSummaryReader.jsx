import React from 'react';

const CourseSummaryReader = ({ course, onProceedToQuiz, onBackToCatalog }) => {
  if (!course) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Learning Module
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {course.courseId}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {course.title}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Carefully study the concepts below before attempting the 15-question assessment.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onBackToCatalog}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium px-3.5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            ← Catalog
          </button>
          <button
            onClick={onProceedToQuiz}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Proceed to Quiz</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Reader Content */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-sm">
        <div className="prose prose-blue max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-serif">
          {course.masterSummary || 'No summary available for this course.'}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-6 rounded-xl">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Finished Reading?</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Ready to test your knowledge with 10 theoretical questions and 5 practical scenario cases?
            </p>
          </div>
          <button
            onClick={onProceedToQuiz}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-8 py-3 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Start 15-Question Assessment Room →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseSummaryReader;
