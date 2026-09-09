import React, { useState, useEffect } from 'react';

const Quiz = ({ mcqs, courseId, currentUser, onQuizComplete, onBackToSummary }) => {
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [lastActionTime, setLastActionTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    setLastActionTime(Date.now());
  }, []);

  const handleSelect = (qIndex, option) => {
    if (submitted) return;

    if (!timeSpent[qIndex]) {
      const now = Date.now();
      const secondsSpent = Math.max(1, Math.round((now - lastActionTime) / 1000));
      setTimeSpent((prev) => ({ ...prev, [qIndex]: secondsSpent }));
      setLastActionTime(now);
    }

    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    let score = 0;
    const graded = mcqs.map((mcq, idx) => {
      const isCorrect = answers[idx] === mcq.correct_answer;
      if (isCorrect) score++;
      return {
        question: mcq.question,
        type: mcq.type || (idx >= 10 ? 'application' : 'theoretical'),
        selected_answer: answers[idx] || 'Unanswered',
        correct_answer: mcq.correct_answer,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent[idx] || 5,
        explanation: mcq.explanation || 'No explanation provided.',
        topic: mcq.topic || 'General'
      };
    });

    const finalPayload = {
      courseId,
      phone: currentUser?.phone || null,
      learnerName: currentUser?.name || 'Civil Servant Learner',
      timestamp: new Date().toISOString(),
      score: `${score}/${mcqs.length}`,
      details: graded
    };

    setResults(finalPayload);
    setSubmitted(true);

    if (onQuizComplete) {
      onQuizComplete(finalPayload);
    }
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Assessment in Progress
            </span>
            <span className="text-xs text-gray-500 font-mono">
              📱 {currentUser?.phone} ({currentUser?.name})
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Competency Evaluation Room
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {onBackToSummary && (
            <button
              onClick={onBackToSummary}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              📖 Review Summary
            </button>
          )}
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            {answeredCount}/{mcqs.length} Answered
          </span>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {mcqs.map((mcq, idx) => {
          const isApplication = (mcq.type || '').toLowerCase() === 'application' || idx >= 10;

          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all ${
                answers[idx]
                  ? 'bg-white border-blue-300 shadow-sm'
                  : 'bg-white border-gray-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-semibold text-gray-900 text-sm sm:text-base leading-relaxed">
                  <span className="text-blue-600 font-bold mr-2">Q{idx + 1}.</span>
                  {mcq.question}
                </p>
                <span
                  className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isApplication
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}
                >
                  {isApplication ? 'Scenario' : 'Theoretical'}
                </span>
              </div>

              {mcq.topic && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Competency Domain: {mcq.topic}
                  </span>
                </div>
              )}

              <div className="space-y-2.5">
                {mcq.options.map((opt, i) => {
                  const isSelected = answers[idx] === opt;
                  let bgClass = 'bg-gray-50/50 border-gray-200 hover:bg-blue-50/50 hover:border-blue-300 text-gray-800';

                  if (submitted) {
                    if (opt === mcq.correct_answer) {
                      bgClass = 'bg-green-100 border-green-500 font-medium text-green-900 shadow-xs';
                    } else if (isSelected) {
                      bgClass = 'bg-red-100 border-red-500 line-through text-red-900 shadow-xs';
                    } else {
                      bgClass = 'bg-white border-gray-100 opacity-50 text-gray-400';
                    }
                  } else if (isSelected) {
                    bgClass = 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/30 text-blue-900 font-semibold shadow-xs';
                  }

                  return (
                    <div
                      key={i}
                      onClick={() => handleSelect(idx, opt)}
                      className={`p-3.5 border rounded-xl cursor-pointer transition-all text-sm flex items-center justify-between ${bgClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0 opacity-75">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {submitted && opt === mcq.correct_answer && (
                        <span className="text-xs font-bold text-green-700 bg-green-200/50 px-2 py-0.5 rounded">✓ Correct</span>
                      )}
                      {submitted && isSelected && opt !== mcq.correct_answer && (
                        <span className="text-xs font-bold text-red-700 bg-red-200/50 px-2 py-0.5 rounded">✗ Chosen</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {timeSpent[idx] && (
                <div className="mt-3 text-right">
                  <span className="text-xs text-gray-400 font-mono">
                    ⏱️ {timeSpent[idx]} seconds spent
                  </span>
                </div>
              )}

              {submitted && mcq.explanation && (
                <div className="mt-4 p-4 bg-blue-50/80 border border-blue-200 text-xs text-blue-950 rounded-xl leading-relaxed">
                  <strong className="font-semibold text-blue-900 block mb-0.5">Explanation:</strong> {mcq.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Footer */}
      {!submitted ? (
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-gray-200 shadow-xl flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900">Ready to Submit Evaluation?</p>
            <p className="text-xs text-gray-500">
              {answeredCount === mcqs.length
                ? 'All questions answered! Ready for AI evaluation.'
                : `${mcqs.length - answeredCount} questions remaining.`}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            Submit & Analyze Competency →
          </button>
        </div>
      ) : (
        <div className="text-center p-8 bg-green-50 text-green-950 rounded-2xl font-bold border border-green-200 shadow-sm">
          <p className="text-xl">Evaluation Submitted! Score: {results?.score}</p>
          <p className="text-xs font-normal text-green-800 mt-1">
            Running Competency Analysis Agent and updating your lifelong learning ledger...
          </p>
        </div>
      )}
    </div>
  );
};

export default Quiz;
