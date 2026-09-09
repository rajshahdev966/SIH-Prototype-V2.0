const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_DIR = path.join(__dirname);
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'sih_portal.db');
const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Password hashing utility using SHA-256 with salt
const DEFAULT_SALT = process.env.ADMIN_PASSWORD_SALT || 'sih_igot_salt_2026';
function hashPassword(password, salt = DEFAULT_SALT) {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Initialize Schema
function initDb() {
    db.exec(`
        -- Admins Table
        CREATE TABLE IF NOT EXISTS admins (
            username TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT
        );

        -- Admin Sessions Table
        CREATE TABLE IF NOT EXISTS admin_sessions (
            token TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            created_at TEXT,
            expires_at TEXT,
            FOREIGN KEY (username) REFERENCES admins (username) ON DELETE CASCADE
        );

        -- Users Table (Learners)
        CREATE TABLE IF NOT EXISTS users (
            phone TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at TEXT
        );

        -- Courses Table
        CREATE TABLE IF NOT EXISTS courses (
            course_id TEXT PRIMARY KEY,
            title TEXT,
            master_summary TEXT,
            status TEXT DEFAULT 'published',
            created_at TEXT,
            updated_at TEXT
        );

        -- MCQs Table
        CREATE TABLE IF NOT EXISTS mcqs (
            course_id TEXT PRIMARY KEY,
            mcqs_json TEXT,
            count INTEGER,
            created_at TEXT,
            FOREIGN KEY (course_id) REFERENCES courses (course_id) ON DELETE CASCADE
        );

        -- Submissions Table
        CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY,
            course_id TEXT,
            phone TEXT,
            learner_name TEXT,
            score TEXT,
            score_percentage REAL,
            details_json TEXT,
            profile_json TEXT,
            created_at TEXT,
            FOREIGN KEY (course_id) REFERENCES courses (course_id) ON DELETE CASCADE,
            FOREIGN KEY (phone) REFERENCES users (phone) ON DELETE SET NULL
        );

        -- Cumulative Analyses Table
        CREATE TABLE IF NOT EXISTS cumulative_analyses (
            phone TEXT PRIMARY KEY,
            profile_json TEXT,
            tests_analyzed INTEGER,
            updated_at TEXT,
            FOREIGN KEY (phone) REFERENCES users (phone) ON DELETE CASCADE
        );

        -- Indices
        CREATE INDEX IF NOT EXISTS idx_submissions_course ON submissions(course_id);
        CREATE INDEX IF NOT EXISTS idx_submissions_phone ON submissions(phone);
    `);

    // Automatic Column Migrations
    try {
        const subCols = db.prepare("PRAGMA table_info(submissions)").all().map(c => c.name);
        if (!subCols.includes('phone')) {
            db.exec("ALTER TABLE submissions ADD COLUMN phone TEXT;");
        }
        const courseCols = db.prepare("PRAGMA table_info(courses)").all().map(c => c.name);
        if (!courseCols.includes('status')) {
            db.exec("ALTER TABLE courses ADD COLUMN status TEXT DEFAULT 'published';");
        }
    } catch (migErr) {
        console.warn('Migration note:', migErr.message);
    }

    // Seed Initial Root Admin if none exists
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
    if (adminCount === 0) {
        const initialUser = (process.env.ADMIN_INITIAL_USER || 'admin').trim();
        const initialPass = process.env.ADMIN_INITIAL_PASSWORD || 'iGOT@Admin2026';
        const initialEmail = process.env.ADMIN_INITIAL_EMAIL || (initialUser + '@igot.gov.in');
        const initialPassHash = hashPassword(initialPass);
        db.prepare('INSERT INTO admins (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
          .run(initialUser, initialEmail, initialPassHash, new Date().toISOString());
        console.log('[Security] Initial root admin initialized from environment: username=' + initialUser);
    }
}

initDb();

// ==========================================
// Admin Authentication & Administration
// ==========================================

function verifyAdminCredentials(username, password) {
    if (!username || !password) return null;
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username.trim());
    if (!admin) return null;

    const hash = hashPassword(password);
    if (admin.password_hash !== hash) return null;

    return { username: admin.username, email: admin.email, createdAt: admin.created_at };
}

function createAdminSession(username) {
    const token = 'adm_' + crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    db.prepare('INSERT INTO admin_sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .run(token, username, now.toISOString(), expires.toISOString());

    return token;
}

function validateAdminSession(token) {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '').trim();
    const session = db.prepare(`
        SELECT s.token, s.username, s.expires_at, a.email
        FROM admin_sessions s
        JOIN admins a ON s.username = a.username
        WHERE s.token = ?
    `).get(cleanToken);

    if (!session) return null;
    if (new Date(session.expires_at) < new Date()) {
        db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(cleanToken);
        return null;
    }

    return { username: session.username, email: session.email };
}

function revokeAdminSession(token) {
    if (!token) return;
    const cleanToken = token.replace('Bearer ', '').trim();
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(cleanToken);
}

function updateAdminProfile(username, { email, password }) {
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (!admin) throw new Error('Admin not found');

    const newEmail = email ? email.trim().toLowerCase() : admin.email;
    let newHash = admin.password_hash;
    if (password && password.trim().length >= 6) {
        newHash = hashPassword(password.trim());
    }

    db.prepare('UPDATE admins SET email = ?, password_hash = ? WHERE username = ?')
      .run(newEmail, newHash, username);

    return { username, email: newEmail };
}

function createNewAdmin({ username, email, password }) {
    if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
    }
    const cleanUser = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    
    const existing = db.prepare('SELECT * FROM admins WHERE username = ?').get(cleanUser);
    if (existing) throw new Error(`Admin with username "${cleanUser}" already exists`);

    const hash = hashPassword(password.trim());
    db.prepare('INSERT INTO admins (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
      .run(cleanUser, cleanEmail, hash, new Date().toISOString());

    return { username: cleanUser, email: cleanEmail };
}

function getAllAdmins() {
    return db.prepare('SELECT username, email, created_at FROM admins ORDER BY created_at ASC').all();
}

// ==========================================
// User Authentication (Learners)
// ==========================================

function findOrCreateUser({ phone, name, email }) {
    if (!phone) throw new Error('Phone number is required');
    const cleanPhone = phone.trim();
    const cleanName = (name || 'Learner').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
    if (existing) {
        if ((cleanName && cleanName !== existing.name) || (cleanEmail && cleanEmail !== existing.email)) {
            db.prepare('UPDATE users SET name = ?, email = ? WHERE phone = ?')
              .run(cleanName || existing.name, cleanEmail || existing.email, cleanPhone);
        }
        return db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
    }

    db.prepare('INSERT INTO users (phone, name, email, created_at) VALUES (?, ?, ?, ?)')
      .run(cleanPhone, cleanName, cleanEmail, now);
      
    return db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
}

function getUser(phone) {
    return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
}

// ==========================================
// Courses & MCQ Management
// ==========================================

function getCourse(courseId) {
    const row = db.prepare('SELECT * FROM courses WHERE course_id = ?').get(courseId);
    if (!row) return null;
    return {
        courseId: row.course_id,
        title: row.title,
        masterSummary: row.master_summary,
        status: row.status || 'published',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function getAllCourses(includeUnpublished = false) {
    let sql = `
        SELECT 
            c.course_id,
            c.title,
            c.status,
            c.created_at,
            c.updated_at,
            LENGTH(c.master_summary) as summary_length,
            m.count as mcq_count,
            (SELECT COUNT(*) FROM submissions s WHERE s.course_id = c.course_id) as submission_count
        FROM courses c
        LEFT JOIN mcqs m ON c.course_id = m.course_id
    `;
    if (!includeUnpublished) {
        sql += ` WHERE c.status = 'published' OR c.status IS NULL `;
    }
    sql += ` ORDER BY c.created_at DESC `;

    const rows = db.prepare(sql).all();
    return rows.map(r => ({
        courseId: r.course_id,
        title: r.title || r.course_id,
        status: r.status || 'published',
        mcqCount: r.mcq_count || 0,
        hasMCQs: (r.mcq_count || 0) > 0,
        submissionCount: r.submission_count || 0,
        hasSummary: (r.summary_length || 0) > 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at
    }));
}

function saveCourse({ courseId, title, masterSummary, status = 'published' }) {
    const now = new Date().toISOString();
    const existing = getCourse(courseId);
    if (existing) {
        db.prepare(`
            UPDATE courses 
            SET title = ?, master_summary = ?, status = ?, updated_at = ?
            WHERE course_id = ?
        `).run(title || existing.title || courseId, masterSummary, status, now, courseId);
    } else {
        db.prepare(`
            INSERT INTO courses (course_id, title, master_summary, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(courseId, title || courseId, masterSummary, status, now, now);
    }
    return getCourse(courseId);
}

function updateCourseAndMCQs(courseId, { title, masterSummary, mcqs, status = 'published' }) {
    const now = new Date().toISOString();
    db.transaction(() => {
        db.prepare(`
            UPDATE courses 
            SET title = ?, master_summary = ?, status = ?, updated_at = ?
            WHERE course_id = ?
        `).run(title, masterSummary, status, now, courseId);

        if (Array.isArray(mcqs)) {
            saveMCQs(courseId, mcqs);
        }
    })();
    return {
        course: getCourse(courseId),
        mcqs: getMCQs(courseId)
    };
}

function getMCQs(courseId) {
    const row = db.prepare('SELECT * FROM mcqs WHERE course_id = ?').get(courseId);
    if (!row || !row.mcqs_json) return null;
    try {
        return JSON.parse(row.mcqs_json);
    } catch (e) {
        console.error(`Failed to parse MCQs JSON for ${courseId}:`, e);
        return null;
    }
}

function saveMCQs(courseId, mcqsArray) {
    const now = new Date().toISOString();
    const count = Array.isArray(mcqsArray) ? mcqsArray.length : 0;
    const jsonStr = JSON.stringify(mcqsArray);

    db.prepare(`
        INSERT INTO mcqs (course_id, mcqs_json, count, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(course_id) DO UPDATE SET
            mcqs_json = excluded.mcqs_json,
            count = excluded.count,
            created_at = excluded.created_at
    `).run(courseId, jsonStr, count, now);

    return getMCQs(courseId);
}

// ==========================================
// Submissions & Cumulative Analytics
// ==========================================

function saveSubmission({ id, courseId, phone, learnerName, score, scorePercentage, details, profile }) {
    const subId = id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    
    let calculatedPct = scorePercentage;
    if (calculatedPct === undefined && typeof score === 'string' && score.includes('/')) {
        const [num, den] = score.split('/').map(Number);
        if (den > 0) calculatedPct = Math.round((num / den) * 100);
    }

    db.prepare(`
        INSERT INTO submissions (
            id, course_id, phone, learner_name, score, score_percentage, details_json, profile_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        subId,
        courseId,
        phone || null,
        learnerName || 'Anonymous Learner',
        score || '0/0',
        calculatedPct || 0,
        JSON.stringify(details || []),
        JSON.stringify(profile || {}),
        now
    );

    return getSubmissionById(subId);
}

function getSubmissionById(id) {
    const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    if (!row) return null;
    return {
        id: row.id,
        courseId: row.course_id,
        phone: row.phone,
        learnerName: row.learner_name,
        score: row.score,
        scorePercentage: row.score_percentage,
        details: JSON.parse(row.details_json || '[]'),
        profile: JSON.parse(row.profile_json || '{}'),
        createdAt: row.created_at
    };
}

function getSubmissions(courseId = null, phone = null) {
    let query = 'SELECT * FROM submissions WHERE 1=1';
    const params = [];

    if (courseId) {
        query += ' AND course_id = ?';
        params.push(courseId);
    }
    if (phone) {
        query += ' AND phone = ?';
        params.push(phone);
    }
    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params);
    return rows.map(row => ({
        id: row.id,
        courseId: row.course_id,
        phone: row.phone,
        learnerName: row.learner_name,
        score: row.score,
        scorePercentage: row.score_percentage,
        details: JSON.parse(row.details_json || '[]'),
        profile: JSON.parse(row.profile_json || '{}'),
        createdAt: row.created_at
    }));
}

function saveCumulativeAnalysis(phone, profile, testsCount) {
    const now = new Date().toISOString();
    db.prepare(`
        INSERT INTO cumulative_analyses (phone, profile_json, tests_analyzed, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(phone) DO UPDATE SET
            profile_json = excluded.profile_json,
            tests_analyzed = excluded.tests_analyzed,
            updated_at = excluded.updated_at
    `).run(phone, JSON.stringify(profile), testsCount, now);

    return getCumulativeAnalysis(phone);
}

function getCumulativeAnalysis(phone) {
    const row = db.prepare('SELECT * FROM cumulative_analyses WHERE phone = ?').get(phone);
    if (!row) return null;
    return {
        phone: row.phone,
        profile: JSON.parse(row.profile_json || '{}'),
        testsAnalyzed: row.tests_analyzed,
        updatedAt: row.updated_at
    };
}

function deleteCourse(courseId) {
    db.prepare('DELETE FROM submissions WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM mcqs WHERE course_id = ?').run(courseId);
    const result = db.prepare('DELETE FROM courses WHERE course_id = ?').run(courseId);
    return result.changes > 0;
}

// Database stats for Admin Dashboard
function getDatabaseStats() {
    return {
        coursesCount: db.prepare('SELECT COUNT(*) as c FROM courses').get().c,
        mcqsCount: db.prepare('SELECT COUNT(*) as c FROM mcqs').get().c,
        submissionsCount: db.prepare('SELECT COUNT(*) as c FROM submissions').get().c,
        usersCount: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
        adminsCount: db.prepare('SELECT COUNT(*) as c FROM admins').get().c,
        dbPath: DB_PATH
    };
}

module.exports = {
    initDb,
    verifyAdminCredentials,
    createAdminSession,
    validateAdminSession,
    revokeAdminSession,
    updateAdminProfile,
    createNewAdmin,
    getAllAdmins,
    findOrCreateUser,
    getUser,
    getCourse,
    getAllCourses,
    saveCourse,
    updateCourseAndMCQs,
    getMCQs,
    saveMCQs,
    saveSubmission,
    getSubmissionById,
    getSubmissions,
    saveCumulativeAnalysis,
    getCumulativeAnalysis,
    deleteCourse,
    getDatabaseStats
};
