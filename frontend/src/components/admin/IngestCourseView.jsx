import React, { useState } from 'react';
import { RiAlertLine, RiCheckLine, RiCheckboxCircleLine } from '@remixicon/react';
import { API_BASE_URL } from '../../config';

const SAMPLE_COURSES = [
  { id: 'do_1143052789530787841562', label: 'Agile & Scrum Course (do_114305...)' },
  { id: 'do_1137349872069099521269', label: 'Multi-Asset PDF/Video Course (do_113734...)' }
];

const IngestCourseView = ({ adminToken, onCourseIngested, onBackToCatalog }) => {
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: idle, 1: checking, 2: extracting, 3: mcqs, 4: saving, 5: done
  const [ingestResult, setIngestResult] = useState(null);
  const [error, setError] = useState('');

  const handleIngest = async (e) => {
    if (e) e.preventDefault();
    if (!courseId.trim()) return;

    setError('');
    setLoading(true);
    setCurrentStep(1);
    setIngestResult(null);

    try {
      // Step timer simulation for user-friendly UI progress while the backend runs
      const stepTimer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < 4) return prev + 1;
          return prev;
        });
      }, 12000);

      const token = adminToken || sessionStorage.getItem('sih_admin_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/courses/ingest`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ courseId: courseId.trim() })
      });

      clearInterval(stepTimer);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to ingest course');
      }

      setCurrentStep(5);
      setIngestResult(data);
      if (onCourseIngested) {
        onCourseIngested(data.data);
      }
    } catch (err) {
      setError(err.message);
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Ingest New iGOT Course</h2>
            <p className="text-sm text-gray-500 mt-1">
              Runs the Extraction & MCQ Generation agents once. Results are saved to the database.
            </p>
          </div>
          <button
            onClick={onBackToCatalog}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium px-3 py-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            ← Back to Catalog
          </button>
        </div>

        <form onSubmit={handleIngest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Course ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. do_1143052789530787841562"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={loading || !courseId.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
              >
                {loading ? 'Processing...' : 'Ingest Course'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-medium text-gray-400 mr-2">Quick Presets:</span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {SAMPLE_COURSES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => setCourseId(sample.id)}
                  disabled={loading}
                  className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 font-mono py-1 px-2.5 rounded border border-gray-200 transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-3">
            <RiAlertLine size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Ingestion Failed:</strong> {error}
            </div>
          </div>
        )}
      </div>

      {/* Real-time agent progress */}
      {loading && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-3">
            Autonomous Pipeline Progress
          </h3>

          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg text-sm ${currentStep >= 1 ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'text-gray-400'}`}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-current">
                {currentStep > 1 ? <RiCheckLine size={14} /> : '1'}
              </span>
              <span>Checking database cache for course metadata...</span>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg text-sm ${currentStep >= 2 ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'text-gray-400'}`}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-current">
                {currentStep > 2 ? <RiCheckLine size={14} /> : '2'}
              </span>
              <span><strong>Browser Extraction Agent:</strong> Downloading media assets, transcribing audio and PDFs...</span>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg text-sm ${currentStep >= 3 ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'text-gray-400'}`}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-current">
                {currentStep > 3 ? <RiCheckLine size={14} /> : '3'}
              </span>
              <span>Synthesizing comprehensive Structured Learning Document...</span>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg text-sm ${currentStep >= 4 ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'text-gray-400'}`}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-current">
                {currentStep > 4 ? <RiCheckLine size={14} /> : '4'}
              </span>
              <span><strong>MCQ Generation Agent:</strong> Generating 15 rigorous theoretical & scenario questions...</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {ingestResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <RiCheckboxCircleLine size={24} className="text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-green-900 text-base">
                {ingestResult.cached ? 'Loaded from Database Cache' : 'Course Ingested Successfully!'}
              </h3>
              <p className="text-sm text-green-800 mt-1">
                {ingestResult.message}
              </p>
              <div className="mt-4 p-3 bg-white rounded-lg border border-green-200 text-xs text-gray-700 space-y-1">
                <p><strong>Title:</strong> {ingestResult.data.title}</p>
                <p><strong>Course ID:</strong> {ingestResult.data.courseId}</p>
                <p><strong>MCQs Ready:</strong> {ingestResult.data.mcqs?.length || 15} questions stored in database</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => onCourseIngested(ingestResult.data)}
                  className="bg-green-700 hover:bg-green-800 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Start Assessment Room →
                </button>
                <button
                  onClick={onBackToCatalog}
                  className="bg-white hover:bg-gray-100 text-gray-700 font-medium text-xs py-2.5 px-4 rounded-lg border border-gray-300 transition-colors cursor-pointer"
                >
                  Return to Catalog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngestCourseView;
