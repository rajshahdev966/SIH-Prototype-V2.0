import React, { useState, useEffect } from 'react';
import IngestCourseView from './IngestCourseView';

const AdminPortal = ({ adminUser, adminToken, onLogout }) => {
  const [adminTab, setAdminTab] = useState('catalog');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [editingCourse, setEditingCourse] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editStatus, setEditStatus] = useState('published');
  const [editMCQs, setEditMCQs] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const [myEmail, setMyEmail] = useState(adminUser?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminList, setAdminList] = useState([]);
  const [dbStats, setDbStats] = useState(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  useEffect(() => {
    fetchCourses();
    if (adminTab === 'security') fetchAdminList();
    if (adminTab === 'database') fetchDbStats();
  }, [adminTab]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/courses?admin=true', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) setCourses(data.courses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminList = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/list', { headers: authHeaders });
      const data = await res.json();
      if (data.success) setAdminList(data.admins || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDbStats = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/stats', { headers: authHeaders });
      const data = await res.json();
      if (data.success) setDbStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = async (courseId) => {
    setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/courses/${courseId}`, { headers: authHeaders });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch course');

      setEditingCourse(data.course);
      setEditTitle(data.course.title || '');
      setEditSummary(data.course.masterSummary || '');
      setEditStatus(data.course.status || 'published');
      setEditMCQs(data.course.mcqs || []);
      setAdminTab('editor');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveCourseEdits = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSavingEdit(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await fetch(`http://localhost:3001/api/admin/courses/${editingCourse.courseId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          title: editTitle.trim(),
          masterSummary: editSummary,
          mcqs: editMCQs,
          status: editStatus
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save edits');
      setSuccessMessage('Course updated and published successfully!');
      await fetchCourses();
      setAdminTab('catalog');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm(`Delete course ${courseId}?`)) return;
    try {
      const res = await fetch(`http://localhost:3001/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete course');
      setSuccessMessage(`Course ${courseId} deleted.`);
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await fetch('http://localhost:3001/api/admin/profile', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ email: myEmail, password: newPassword })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update credentials');
      setSuccessMessage('Your administrative credentials have been updated.');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCreateNewAdmin = async (e) => {
    e.preventDefault();
    setCreatingAdmin(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await fetch('http://localhost:3001/api/admin/create-admin', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          username: newAdminUser.trim(),
          email: newAdminEmail.trim(),
          password: newAdminPass.trim()
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create new admin');
      setSuccessMessage(`Admin "${data.admin.username}" created successfully!`);
      setNewAdminUser('');
      setNewAdminEmail('');
      setNewAdminPass('');
      fetchAdminList();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleMCQChange = (index, field, value) => {
    setEditMCQs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    setEditMCQs((prev) => {
      const updated = [...prev];
      const opts = [...(updated[qIndex].options || [])];
      opts[optIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return updated;
    });
  };
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
              SECURE ADMIN HUB
            </span>
            <span className="text-xs text-slate-400 font-mono">
              👤 {adminUser?.username} ({adminUser?.email})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            iGOT Karmayogi Governance Center
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAdminTab('catalog')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'catalog' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Courses ({courses.length})
          </button>
          <button
            onClick={() => setAdminTab('ingest')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'ingest' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            + Ingest Course
          </button>
          <button
            onClick={() => setAdminTab('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'security' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔐 Admins & Security
          </button>
          <button
            onClick={() => setAdminTab('database')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'database' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🗄️ Database
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-2xl flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Catalog Tab */}
      {adminTab === 'catalog' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Ingested Courses ({courses.length})
            </h3>
            <button
              onClick={() => setAdminTab('ingest')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              + Ingest New Course
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading course ledger...
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              No courses ingested yet.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3.5 text-left font-bold text-gray-500 uppercase">Title & Course ID</th>
                  <th className="px-6 py-3.5 text-left font-bold text-gray-500 uppercase">MCQs</th>
                  <th className="px-6 py-3.5 text-left font-bold text-gray-500 uppercase">Submissions</th>
                  <th className="px-6 py-3.5 text-left font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3.5 text-right font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {courses.map((c) => (
                  <tr key={c.courseId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                      <p className="text-gray-400 font-mono text-xs">{c.courseId}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {c.mcqCount} Questions
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600">{c.submissionCount}</span> learner attempts
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {c.status || 'published'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleStartEdit(c.courseId)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3.5 py-1.5 rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                      >
                        ✏️ Edit Course & MCQs
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.courseId)}
                        className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Ingest Tab */}
      {adminTab === 'ingest' && (
        <IngestCourseView
          adminToken={adminToken}
          onCourseIngested={() => {
            fetchCourses();
            setAdminTab('catalog');
          }}
          onBackToCatalog={() => setAdminTab('catalog')}
        />
      )}
      {/* Editor Tab */}
      {adminTab === 'editor' && editingCourse && (
        <form onSubmit={handleSaveCourseEdits} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-3">
            <div>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Live Content Editor
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">Course Customizer</h3>
              <p className="text-xs text-gray-400 font-mono">Course ID: {editingCourse.courseId}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdminTab('catalog')}
                className="text-xs text-gray-600 font-semibold px-4 py-2 rounded-xl border border-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm cursor-pointer"
              >
                {savingEdit ? 'Saving...' : '💾 Save & Publish'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Course Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800"
              >
                <option value="published">Published (Learner Portal)</option>
                <option value="draft">Draft (Admin Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Structured Learning Document (Markdown)
            </label>
            <textarea
              rows={10}
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-2xl text-xs font-mono text-gray-800 leading-relaxed bg-gray-50"
            />
          </div>

          <div className="space-y-6">
            <div className="border-b pb-2 flex items-center justify-between">
              <h4 className="text-base font-bold text-gray-900">Questions ({editMCQs.length})</h4>
              <span className="text-xs text-gray-500">Select radio for correct answer.</span>
            </div>

            {editMCQs.map((q, idx) => (
              <div key={idx} className="p-5 border border-gray-200 rounded-2xl bg-gray-50 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-bold text-blue-700 text-sm">Q{idx + 1}.</span>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleMCQChange(idx, 'question', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-900"
                  />
                  <select
                    value={q.type || 'theoretical'}
                    onChange={(e) => handleMCQChange(idx, 'type', e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-700"
                  >
                    <option value="theoretical">Theoretical</option>
                    <option value="application">Application</option>
                  </select>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-blue-300">
                  {q.options?.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={'correct_' + idx}
                        checked={q.correct_answer === opt}
                        onChange={() => handleMCQChange(idx, 'correct_answer', opt)}
                        className="w-4 h-4 text-emerald-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                        className={'flex-1 px-3 py-1.5 rounded-xl text-xs border ' + (q.correct_answer === opt ? 'bg-emerald-50 border-emerald-400 font-medium text-emerald-900' : 'bg-white border-gray-300 text-gray-800')}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={q.explanation || ''}
                    onChange={(e) => handleMCQChange(idx, 'explanation', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-700"
                    placeholder="Explanation"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xl flex items-center justify-between">
            <span className="text-xs text-gray-500">Review completed?</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAdminTab('catalog')}
                className="text-xs text-gray-600 font-semibold px-4 py-2 rounded-xl border border-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2 rounded-xl shadow-sm cursor-pointer"
              >
                {savingEdit ? 'Saving...' : '💾 Save & Publish'}
              </button>
            </div>
          </div>
        </form>
      )}
      {/* Security Tab */}
      {adminTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">🔑 Change My Password & Email</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Username</label>
                <input type="text" value={adminUser?.username} disabled className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-xs font-mono text-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
                <input type="email" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} required className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 chars" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900" />
              </div>
              <button type="submit" disabled={updatingProfile} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer">
                {updatingProfile ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">➕ Provision New Admin</h3>
            </div>
            <form onSubmit={handleCreateNewAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Admin Username *</label>
                <input type="text" value={newAdminUser} onChange={(e) => setNewAdminUser(e.target.value)} required placeholder="e.g. raj_admin" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Official Email *</label>
                <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} required placeholder="e.g. raj.admin@igot.gov.in" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Initial Password *</label>
                <input type="password" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} required placeholder="Min 6 chars" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900" />
              </div>
              <button type="submit" disabled={creatingAdmin} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer">
                {creatingAdmin ? 'Provisioning...' : 'Provision Admin'}
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-xs font-bold text-gray-700 uppercase">Admins List ({adminList.length})</h4>
            </div>
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {adminList.map((a) => (
                  <tr key={a.username} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 font-bold font-mono text-gray-900">{a.username} {a.username === adminUser?.username && '(You)'}</td>
                    <td className="px-6 py-3.5 text-gray-600">{a.email}</td>
                    <td className="px-6 py-3.5 text-gray-400">{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Database Diagnostics Tab */}
      {adminTab === 'database' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🗄️</span> SQLite Architecture & Metrics
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Database File: <code className="font-mono text-blue-600 font-bold">backend/database/sih_portal.db</code>
              </p>
            </div>
            <button onClick={fetchDbStats} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer">↻ Refresh</button>
          </div>

          {dbStats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Courses</span>
                <span className="text-2xl font-black text-slate-900">{dbStats.coursesCount}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">MCQ Sets</span>
                <span className="text-2xl font-black text-slate-900">{dbStats.mcqsCount}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Submissions</span>
                <span className="text-2xl font-black text-blue-600">{dbStats.submissionsCount}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Learners</span>
                <span className="text-2xl font-black text-emerald-600">{dbStats.usersCount}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Admins</span>
                <span className="text-2xl font-black text-red-600">{dbStats.adminsCount}</span>
              </div>
            </div>
          )}

          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2 text-xs text-blue-950">
            <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
              <span>💡</span> Database Operations Guide
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li><strong>Physical Storage:</strong> The entire system data is stored in <code className="bg-white px-2 py-0.5 rounded border">sih_portal.db</code>. Backing up the database is as simple as copying this single file.</li>
              <li><strong>Zero-Friction Migration:</strong> In production, switching to PostgreSQL (e.g. Supabase, AWS RDS) only requires modifying <code className="bg-white px-2 py-0.5 rounded border">backend/database/db.js</code> with no changes needed in the frontend or agent logic.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
