import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  RiCheckLine,
  RiTimeLine,
  RiStarLine,
  RiFocus3Line,
  RiFileList3Line
} from '@remixicon/react';

const AnalysisDashboard = ({ profile, submission, onRetake, onBackToCatalog, onViewHistory }) => {
  if (!profile) return null;

  const chartData = [
    { name: 'Theoretical', score: profile.theoretical_score_percentage || 0 },
    { name: 'Application', score: profile.application_score_percentage || 0 },
  ];

  const getProficiencyStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'expert':
        return {
          card: 'bg-emerald-50 border-emerald-300 text-emerald-900',
          badge: 'bg-emerald-200 text-emerald-900',
          accent: '#059669'
        };
      case 'competent':
        return {
          card: 'bg-blue-50 border-blue-300 text-blue-900',
          badge: 'bg-blue-200 text-blue-900',
          accent: '#2563eb'
        };
      case 'novice':
        return {
          card: 'bg-amber-50 border-amber-300 text-amber-900',
          badge: 'bg-amber-200 text-amber-900',
          accent: '#d97706'
        };
      default:
        return {
          card: 'bg-gray-50 border-gray-300 text-gray-900',
          badge: 'bg-gray-200 text-gray-900',
          accent: '#4b5563'
        };
    }
  };

  const style = getProficiencyStyle(profile.overall_proficiency);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className={`p-6 rounded-xl border-2 text-center shadow-sm ${style.card}`}>
        <div className="flex items-center justify-between text-xs font-semibold opacity-75 mb-2">
          <span>Learner: {submission?.learnerName || 'Candidate'}</span>
          <span className="flex items-center gap-1">
            Database Record: {submission?.id ? (
              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                <RiCheckLine size={13} /> Saved
              </span>
            ) : 'Generated'}
          </span>
        </div>
        <h3 className="text-xs uppercase tracking-widest font-bold opacity-75">
          AI Evaluated Competency Profile
        </h3>
        <p className="text-4xl font-extrabold mt-1">{profile.overall_proficiency}</p>
        <p className="mt-2 text-sm font-semibold opacity-90">
          Assessment Score: <span className="text-base font-bold">{profile.score}</span>
        </p>
      </div>

      {/* Skill Split & Time Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-3 border-b pb-2">
            Skill Dimension Split
          </h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 500 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Proficiency']} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> Theory ({profile.theoretical_score_percentage || 0}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500 inline-block"></span> Application ({profile.application_score_percentage || 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-3 border-b pb-2 flex items-center gap-2">
              <RiTimeLine size={16} className="text-blue-600" />
              <span>Time Management Analysis</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {profile.time_management_analysis}
            </p>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            Pacing data is gathered live per question and correlated with error rates across topic domains.
          </div>
        </div>
      </div>

      {/* Strengths & Knowledge Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 border border-green-200 rounded-xl shadow-sm">
          <h4 className="font-bold text-green-800 text-sm mb-3 flex items-center gap-2 border-b border-green-100 pb-2">
            <RiStarLine size={16} className="text-green-600" />
            <span>Core Strengths</span>
          </h4>
          {profile.strengths && profile.strengths.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-gray-700">
              {profile.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <RiCheckLine size={14} className="text-green-600 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 italic">No specific standout strengths recorded.</p>
          )}
        </div>

        <div className="bg-white p-5 border border-amber-200 rounded-xl shadow-sm">
          <h4 className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2 border-b border-amber-100 pb-2">
            <RiFocus3Line size={16} className="text-amber-600" />
            <span>Targeted Knowledge Gaps</span>
          </h4>
          {profile.knowledge_gaps && profile.knowledge_gaps.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-gray-700">
              {profile.knowledge_gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 italic">No major knowledge gaps detected!</p>
          )}
        </div>
      </div>

      {/* Remediation Plan */}
      <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl shadow-sm">
        <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-2">
          <RiFileList3Line size={18} className="text-indigo-600" />
          <span>AI Recommended Remediation & Study Roadmap</span>
        </h4>
        <p className="text-indigo-900 text-xs leading-relaxed">
          {profile.remediation_plan}
        </p>
      </div>

      {/* Navigation & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={onBackToCatalog}
          className="text-xs text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          ← Return to Course Catalog
        </button>

        <div className="flex gap-3">
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="text-xs bg-white text-blue-600 border border-blue-300 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              View All Submissions
            </button>
          )}
          {onRetake && (
            <button
              onClick={onRetake}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
