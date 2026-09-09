import React, { useState, useEffect } from 'react';

const CumulativeGrowthDashboard = ({ currentUser, onSelectPastSubmission, onBackToCatalog }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.phone) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/user/${encodeURIComponent(currentUser.phone)}/profile`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load profile');
      setProfileData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCumulativeAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/user/${encodeURIComponent(currentUser.phone)}/cumulative-analysis`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate cumulative analysis');
      await fetchUserProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getProficiencyStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'distinguished expert':
      case 'expert':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'proficient practitioner':
      case 'competent':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'emerging talent':
      case 'novice':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const submissions = profileData?.submissions || [];
  const cumulative = profileData?.cumulativeAnalysis?.profile;

  const totalTests = submissions.length;
  const avgScore = totalTests > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.scorePercentage || 0), 0) / totalTests)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Officer ID Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'O'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{currentUser?.name || 'Civil Servant'}</h2>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                Official Account
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              📱 {currentUser?.phone} • ✉️ {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBackToCatalog}
            className="text-xs text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            ← Back to Catalog
          </button>
          <button
            onClick={handleRunCumulativeAnalysis}
            disabled={analyzing || totalTests === 0}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Synthesizing All Tests...</span>
              </>
            ) : (
              <>
                <span>⚡ Run Holistic Multi-Test AI Synthesis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Total Completed Assessments
          </span>
          <span className="text-3xl font-extrabold text-gray-900">{totalTests}</span>
          <span className="text-xs text-gray-500 block mt-1">Modules Graded & Recorded</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Aggregate Score Average
          </span>
          <span className="text-3xl font-extrabold text-blue-600">{avgScore}%</span>
          <span className="text-xs text-gray-500 block mt-1">Across all competencies</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Longitudinal Proficiency
          </span>
          <span className={`inline-block text-sm font-bold px-3 py-1 mt-1 rounded-full border ${getProficiencyStyle(cumulative?.longitudinal_proficiency || (avgScore >= 80 ? 'Expert' : 'Competent'))}`}>
            {cumulative?.longitudinal_proficiency || (avgScore >= 80 ? 'Expert' : 'Competent')}
          </span>
          <span className="text-xs text-gray-500 block mt-1">Evaluated by AI Synthesis Agent</span>
        </div>
      </div>

      {/* Holistic AI Analysis Report Card */}
      {cumulative ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🧠</span> Longitudinal Competency Trajectory
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Holistic synthesis of performance, recurring conceptual patterns, and answering pacing across {profileData?.cumulativeAnalysis?.testsAnalyzed || totalTests} tests.
              </p>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              Updated: {new Date(profileData?.cumulativeAnalysis?.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-950 leading-relaxed font-medium">
            <strong>Trajectory Overview:</strong> {cumulative.trajectory_summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 p-5 rounded-xl">
              <h4 className="font-bold text-green-900 text-sm mb-3 flex items-center gap-2">
                <span>🌟</span> Cross-Module Core Strengths
              </h4>
              <ul className="space-y-2 text-xs text-green-950">
                {cumulative.overarching_strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
              <h4 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
                <span>⚠️</span> Persistent Blind Spots & Complexities
              </h4>
              <ul className="space-y-2 text-xs text-amber-950">
                {cumulative.persistent_blind_spots?.map((blind, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{blind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
              <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                <span>⏱️</span> Longitudinal Pacing & Speed
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {cumulative.cognitive_pacing_profile}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
              <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                <span>⚖️</span> Theory vs. Scenario Synthesis
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {cumulative.cross_domain_synthesis}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl">
            <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
              <span>🎯</span> Lifelong Learning & Career Remediation Roadmap
            </h4>
            <p className="text-xs text-blue-950 leading-relaxed">
              {cumulative.holistic_remediation_roadmap}
            </p>
          </div>
        </div>
      ) : totalTests > 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="text-base font-bold text-gray-800">Holistic Analysis Not Yet Generated</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto my-3">
            You have completed {totalTests} assessment(s). Click the button below to initiate the Cumulative AI Agent to analyze your longitudinal growth trajectory.
          </p>
          <button
            onClick={handleRunCumulativeAnalysis}
            disabled={analyzing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            {analyzing ? 'Generating Multi-Test Synthesis...' : 'Generate Cumulative Analysis Now'}
          </button>
        </div>
      ) : null}

      {/* Test Submission History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            Historical Assessments Ledger ({totalTests})
          </h3>
        </div>

        {totalTests === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No quiz submissions found for this account. Select a course from the catalog to take your first test!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Course ID</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Proficiency</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Completed Date</th>
                <th className="px-6 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {submissions.map((sub, idx) => (
                <tr key={sub.id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-gray-700">{sub.courseId}</td>
                  <td className="px-6 py-3.5 font-bold text-gray-900">{sub.score} ({sub.scorePercentage}%)</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getProficiencyStyle(sub.profile?.overall_proficiency)}`}>
                      {sub.profile?.overall_proficiency || 'Evaluated'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-500">{new Date(sub.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right font-semibold">
                    <button
                      onClick={() => onSelectPastSubmission(sub)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      View Report →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CumulativeGrowthDashboard;
