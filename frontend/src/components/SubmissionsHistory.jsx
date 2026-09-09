import { API_BASE_URL } from '../config';
﻿import React, { useEffect, useState } from 'react';

const SubmissionsHistory = ({ courseId, onSelectSubmission, onBackToCatalog }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [courseId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const url = courseId 
        ? `${API_BASE_URL}/api/courses/${courseId}/submissions`
        : `${API_BASE_URL}/api/courses/all/submissions`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load submissions');
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProficiencyBadge = (proficiency) => {
    switch (proficiency?.toLowerCase()) {
      case 'expert':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'competent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'novice':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Stored Analytics & Submissions</h2>
          <p className="text-sm text-gray-500 mt-1">
            {courseId ? `Historical competency profiles for course ${courseId}` : 'All past quiz submissions'}
          </p>
        </div>
        <button
          onClick={onBackToCatalog}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
        >
          ← Back to Catalog
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading stored submissions from database...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-base font-bold text-gray-800 mb-1">No Submissions Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
            Once a learner completes the 15-question quiz, their score and AI Competency Profile are permanently stored here.
          </p>
          <button
            onClick={onBackToCatalog}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Go to Catalog to Take Quiz
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Proficiency
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {sub.learnerName || 'Anonymous Learner'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-gray-800">{sub.score}</span>
                    <span className="text-xs text-gray-400 ml-1.5">({sub.scorePercentage}%)</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getProficiencyBadge(sub.profile?.overall_proficiency)}`}>
                      {sub.profile?.overall_proficiency || 'Analyzed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <button
                      onClick={() => onSelectSubmission(sub)}
                      className="text-blue-600 hover:text-blue-900 font-semibold cursor-pointer"
                    >
                      View Report →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmissionsHistory;
