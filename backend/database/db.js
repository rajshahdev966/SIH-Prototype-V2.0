const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let effectiveConnectionString = (process.env.DATABASE_URL || process.env.DATABASE_EXTERNAL_URL || '').trim();

if (effectiveConnectionString) {
    try {
        const parsed = new URL(effectiveConnectionString);
        // If internal Render host (e.g. dpg-xxx without dot) is used outside Render, auto-resolve to external host
        if (parsed.hostname.startsWith('dpg-') && !parsed.hostname.includes('.') && !process.env.RENDER) {
            parsed.hostname = `${parsed.hostname}.oregon-postgres.render.com`;
            effectiveConnectionString = parsed.toString();
        }
    } catch (_) {}
}

const isPg = Boolean(effectiveConnectionString);

let pgPool = null;
let sqliteDb = null;

const DB_DIR = path.join(__dirname);
const DB_PATH = path.join(DB_DIR, 'sih_portal.db');

if (isPg) {
    const { Pool } = require('pg');
    pgPool = new Pool({
        connectionString: effectiveConnectionString,
        ssl: { rejectUnauthorized: false }
    });
    console.log('[Database] Using Cloud PostgreSQL (Render Persistent DB)');
} else {
    const Database = require('better-sqlite3');
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }
    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    console.log('[Database] Using Local SQLite:', DB_PATH);
}

// Password hashing utility using SHA-256 with salt
const DEFAULT_SALT = process.env.ADMIN_PASSWORD_SALT || 'sih_igot_salt_2026';
function hashPassword(password, salt = DEFAULT_SALT) {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

let initPromise = null;
function ensureInitialized() {
    if (!initPromise) {
        initPromise = initDb().catch(err => {
            console.error('[Database Init Error]:', err.message);
            initPromise = null;
            throw err;
        });
    }
    return initPromise;
}

// Unified Query Execution Helpers
async function rawQueryOne(sql, params = []) {
    if (isPg) {
        let pIdx = 1;
        const pgSql = sql.replace(/\?/g, () => `$${pIdx++}`);
        const res = await pgPool.query(pgSql, params);
        return res.rows[0] || null;
    } else {
        const row = sqliteDb.prepare(sql).get(...params);
        return row || null;
    }
}

async function rawQueryAll(sql, params = []) {
    if (isPg) {
        let pIdx = 1;
        const pgSql = sql.replace(/\?/g, () => `$${pIdx++}`);
        const res = await pgPool.query(pgSql, params);
        return res.rows;
    } else {
        return sqliteDb.prepare(sql).all(...params);
    }
}

async function rawExecute(sql, params = []) {
    if (isPg) {
        let pIdx = 1;
        const pgSql = sql.replace(/\?/g, () => `$${pIdx++}`);
        const res = await pgPool.query(pgSql, params);
        return { changes: res.rowCount };
    } else {
        const info = sqliteDb.prepare(sql).run(...params);
        return { changes: info.changes };
    }
}

async function queryOne(sql, params = []) {
    await ensureInitialized();
    return rawQueryOne(sql, params);
}

async function queryAll(sql, params = []) {
    await ensureInitialized();
    return rawQueryAll(sql, params);
}

async function execute(sql, params = []) {
    await ensureInitialized();
    return rawExecute(sql, params);
}

const INITIAL_CASE_STUDIES = [
    {
        id: 'cs_gail_revival',
        title: "Turning Around a Stranded Asset : GAIL's Revival of the JBF PTA Plant",
        author: "Capacity Building Commission",
        categories_json: JSON.stringify(["Commerce and Industries"]),
        duration: "1h",
        summary: "A detailed governance case study exploring how public sector leadership, strategic restructuring, and inter-ministerial coordination revived the stranded JBF PTA petrochemical facility under GAIL.",
        lessons_json: JSON.stringify([
            "Asset turnaround via public sector strategic intervention",
            "Regulatory approvals and inter-departmental synergy",
            "Safeguarding industrial employment and sovereign value creation"
        ]),
        status: 'published'
    },
    {
        id: 'cs_assam_forest',
        title: "Forest Landscapes of Assam: Forging Livelihoods and Natural Wealth",
        author: "Capacity Building Commission",
        categories_json: JSON.stringify(["Environment", "Agriculture and Natural Resources"]),
        duration: "1h 30m",
        summary: "An in-depth study of community-centric afforestation, non-timber forest produce (NTFP) value chains, and eco-tourism livelihoods across the Brahmaputra valley.",
        lessons_json: JSON.stringify([
            "Co-management models with indigenous forest dwelling communities",
            "Sustainable harvest standards and direct market linkages",
            "Biodiversity preservation coupled with rural prosperity"
        ]),
        status: 'published'
    },
    {
        id: 'cs_karnataka_urban',
        title: "Digital Shift in Urban Accounting : Karnataka's Municipal Finance",
        author: "Capacity Building Commission",
        categories_json: JSON.stringify(["Science, Technology, and Innovation", "Governance"]),
        duration: "2h",
        summary: "Analyzing Karnataka's pioneering double-entry digital accounting transformation across Urban Local Bodies (ULBs) for transparent fund tracking and credit rating readiness.",
        lessons_json: JSON.stringify([
            "Transitioning ULBs from cash-basis to accrual accounting systems",
            "Real-time municipal dashboard deployment and audit trail automation",
            "Unlocking municipal bond issuances and infrastructure investments"
        ]),
        status: 'published'
    },
    {
        id: 'cs_malapur_transformation',
        title: "From Darkness to Dignity: Transformation of Malapur",
        author: "Capacity Building Commission",
        categories_json: JSON.stringify(["Governance", "Governance and Public Administration"]),
        duration: "1h",
        summary: "Field-level administrative leadership transforming an underserved hamlet through integrated water supply, sanitation saturation, and solar electrification.",
        lessons_json: JSON.stringify([
            "Gram Panchayat saturation drives through district convergence",
            "Grassroots social audits and behavioral nudges",
            "Monitoring public infrastructure lifecycle sustainability"
        ]),
        status: 'published'
    }
];

const ALL_TABLES_SQL = `
    CREATE TABLE IF NOT EXISTS admins (
        username TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        created_at TEXT,
        expires_at TEXT,
        FOREIGN KEY (username) REFERENCES admins (username) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
        phone TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
        course_id TEXT PRIMARY KEY,
        title TEXT,
        author TEXT DEFAULT 'Karmayogi Bharat',
        category TEXT DEFAULT 'Course',
        duration TEXT DEFAULT '30m',
        master_summary TEXT,
        status TEXT DEFAULT 'published',
        created_at TEXT,
        updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS mcqs (
        course_id TEXT PRIMARY KEY,
        mcqs_json TEXT,
        count INTEGER,
        created_at TEXT,
        FOREIGN KEY (course_id) REFERENCES courses (course_id) ON DELETE CASCADE
    );

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

    CREATE TABLE IF NOT EXISTS cumulative_analyses (
        phone TEXT PRIMARY KEY,
        profile_json TEXT,
        tests_analyzed INTEGER,
        updated_at TEXT,
        FOREIGN KEY (phone) REFERENCES users (phone) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS case_studies (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT DEFAULT 'Capacity Building Commission',
        categories_json TEXT,
        duration TEXT DEFAULT '1h',
        summary TEXT,
        lessons_json TEXT,
        status TEXT DEFAULT 'published',
        created_at TEXT,
        updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_course ON submissions(course_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_phone ON submissions(phone);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

// Initialize Schema
async function initDb() {
    if (isPg) {
        await pgPool.query(ALL_TABLES_SQL);
        try {
            await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;');
        } catch (_) {}
    } else {
        sqliteDb.exec(ALL_TABLES_SQL);
        try {
            sqliteDb.exec('ALTER TABLE users ADD COLUMN password_hash TEXT;');
        } catch (_) {}
    }

    // Seed Initial Root Admin if none exists
    const adminCountRow = await rawQueryOne('SELECT COUNT(*) as count FROM admins');
    const adminCount = parseInt(adminCountRow?.count || '0', 10);
    if (adminCount === 0) {
        const initialUser = (process.env.ADMIN_INITIAL_USER || 'admin').trim();
        const initialPass = process.env.ADMIN_INITIAL_PASSWORD || 'iGOT@Admin2026';
        const initialEmail = process.env.ADMIN_INITIAL_EMAIL || (initialUser + '@igot.gov.in');
        const initialPassHash = hashPassword(initialPass);
        await rawExecute('INSERT INTO admins (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
            [initialUser, initialEmail, initialPassHash, new Date().toISOString()]);
        console.log('[Security] Initial root admin initialized: username=' + initialUser);
    }

    // Seed Initial Amrit Gyaan Kosh Case Studies if none exist
    const caseCountRow = await rawQueryOne('SELECT COUNT(*) as count FROM case_studies');
    const caseCount = parseInt(caseCountRow?.count || '0', 10);
    if (caseCount === 0) {
        const now = new Date().toISOString();
        for (const cs of INITIAL_CASE_STUDIES) {
            await rawExecute(`
                INSERT INTO case_studies (id, title, author, categories_json, duration, summary, lessons_json, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [cs.id, cs.title, cs.author, cs.categories_json, cs.duration, cs.summary, cs.lessons_json, cs.status, now, now]);
        }
        console.log('[Database] Seeded 4 initial Amrit Gyaan Kosh case studies.');
    }

    // Migration from local SQLite into PostgreSQL (runs once if Postgres has 0 courses and local SQLite exists)
    if (isPg && fs.existsSync(DB_PATH)) {
        try {
            const coursesCountRow = await rawQueryOne('SELECT COUNT(*) as count FROM courses');
            const pgCourseCount = parseInt(coursesCountRow?.count || '0', 10);

            if (pgCourseCount === 0) {
                console.log('[Migration] Migrating courses and MCQs from local SQLite to PostgreSQL...');
                const Database = require('better-sqlite3');
                const localDb = new Database(DB_PATH);

                const localCourses = localDb.prepare('SELECT * FROM courses').all();
                for (const c of localCourses) {
                    await rawExecute(`
                        INSERT INTO courses (course_id, title, author, category, duration, master_summary, status, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(course_id) DO NOTHING
                    `, [c.course_id, c.title, c.author || 'Karmayogi Bharat', c.category || 'Course', c.duration || '30m', c.master_summary || '', c.status || 'published', c.created_at, c.updated_at]);

                    const localMcq = localDb.prepare('SELECT * FROM mcqs WHERE course_id = ?').get(c.course_id);
                    if (localMcq) {
                        await rawExecute(`
                            INSERT INTO mcqs (course_id, mcqs_json, count, created_at)
                            VALUES (?, ?, ?, ?)
                            ON CONFLICT(course_id) DO UPDATE SET mcqs_json = excluded.mcqs_json, count = excluded.count
                        `, [c.course_id, localMcq.mcqs_json, localMcq.count || 0, localMcq.created_at]);
                    }
                }

                // Migrate local users
                const localUsers = localDb.prepare('SELECT * FROM users').all();
                for (const u of localUsers) {
                    await rawExecute(`
                        INSERT INTO users (phone, name, email, created_at)
                        VALUES (?, ?, ?, ?)
                        ON CONFLICT(phone) DO NOTHING
                    `, [u.phone, u.name, u.email, u.created_at]);
                }

                // Migrate local submissions
                const localSubs = localDb.prepare('SELECT * FROM submissions').all();
                for (const s of localSubs) {
                    await rawExecute(`
                        INSERT INTO submissions (id, course_id, phone, learner_name, score, score_percentage, details_json, profile_json, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO NOTHING
                    `, [s.id, s.course_id, s.phone, s.learner_name, s.score, s.score_percentage, s.details_json, s.profile_json, s.created_at]);
                }

                localDb.close();
                console.log(`[Migration] Successfully transferred ${localCourses.length} courses, ${localUsers.length} users, and ${localSubs.length} submissions to PostgreSQL!`);
            }
        } catch (migErr) {
            console.warn('[Migration Warning]:', migErr.message);
        }
    }
}

// Start async initialization
ensureInitialized();

// ==========================================
// Admin Authentication & Administration
// ==========================================

async function verifyAdminCredentials(username, password) {
    if (!username || !password) return null;
    const admin = await queryOne('SELECT * FROM admins WHERE username = ?', [username.trim()]);
    if (!admin) return null;

    const hash = hashPassword(password);
    if (admin.password_hash !== hash) return null;

    return { username: admin.username, email: admin.email, createdAt: admin.created_at };
}

async function createAdminSession(username) {
    const token = 'adm_' + crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await execute('INSERT INTO admin_sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)',
        [token, username, now.toISOString(), expires.toISOString()]);

    return token;
}

async function validateAdminSession(token) {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '').trim();
    const session = await queryOne(`
        SELECT s.token, s.username, s.expires_at, a.email
        FROM admin_sessions s
        JOIN admins a ON s.username = a.username
        WHERE s.token = ?
    `, [cleanToken]);

    if (!session) return null;
    if (new Date(session.expires_at) < new Date()) {
        await execute('DELETE FROM admin_sessions WHERE token = ?', [cleanToken]);
        return null;
    }

    return { username: session.username, email: session.email };
}

async function revokeAdminSession(token) {
    if (!token) return;
    const cleanToken = token.replace('Bearer ', '').trim();
    await execute('DELETE FROM admin_sessions WHERE token = ?', [cleanToken]);
}

async function updateAdminProfile(username, { email, password }) {
    const admin = await queryOne('SELECT * FROM admins WHERE username = ?', [username]);
    if (!admin) throw new Error('Admin not found');

    const newEmail = email ? email.trim().toLowerCase() : admin.email;
    let newHash = admin.password_hash;
    if (password && password.trim().length >= 6) {
        newHash = hashPassword(password.trim());
    }

    await execute('UPDATE admins SET email = ?, password_hash = ? WHERE username = ?',
        [newEmail, newHash, username]);

    return { username, email: newEmail };
}

async function createNewAdmin({ username, email, password }) {
    if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
    }
    const cleanUser = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    
    const existing = await queryOne('SELECT * FROM admins WHERE username = ?', [cleanUser]);
    if (existing) throw new Error(`Admin with username "${cleanUser}" already exists`);

    const hash = hashPassword(password.trim());
    await execute('INSERT INTO admins (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
        [cleanUser, cleanEmail, hash, new Date().toISOString()]);

    return { username: cleanUser, email: cleanEmail };
}

async function getAllAdmins() {
    return await queryAll('SELECT username, email, created_at FROM admins ORDER BY created_at ASC');
}

// ==========================================
// User Authentication (Learners)
// ==========================================

async function registerUser({ email, password, name }) {
    if (!email || !email.trim()) throw new Error('Email address is required');
    if (!password || !password.trim()) throw new Error('Password is required');
    if (!name || !name.trim()) throw new Error('Name is required');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const existing = await queryOne('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing) {
        const err = new Error('An account with this email already exists. Please log in.');
        err.code = 'EMAIL_ALREADY_EXISTS';
        throw err;
    }

    const hash = hashPassword(password.trim());
    const phoneKey = cleanEmail; // Stable primary key identifier

    await execute(
        'INSERT INTO users (phone, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
        [phoneKey, cleanName, cleanEmail, hash, new Date().toISOString()]
    );

    return {
        name: cleanName,
        email: cleanEmail,
        phone: phoneKey
    };
}

async function verifyUserCredentials(email, password) {
    if (!email || !email.trim()) {
        const err = new Error('Email address is required');
        err.code = 'MISSING_EMAIL';
        throw err;
    }
    if (!password || !password.trim()) {
        const err = new Error('Password is required');
        err.code = 'MISSING_PASSWORD';
        throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await queryOne('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(phone) = ?', [cleanEmail, cleanEmail]);
    
    if (!user) {
        const err = new Error('Account does not exist. Please register first.');
        err.code = 'USER_NOT_FOUND';
        throw err;
    }

    const hash = hashPassword(password.trim());
    if (user.password_hash && user.password_hash !== hash) {
        const err = new Error('Incorrect password. Please verify and try again.');
        err.code = 'INVALID_PASSWORD';
        throw err;
    }

    // If existing legacy user didn't have password_hash, set it on login
    if (!user.password_hash) {
        await execute('UPDATE users SET password_hash = ? WHERE LOWER(email) = ?', [hash, cleanEmail]);
    }

    return {
        name: user.name,
        email: user.email,
        phone: user.phone || user.email,
        createdAt: user.created_at
    };
}

async function findOrCreateUser({ phone, name, email }) {
    if (!phone && !email) throw new Error('Phone number or email is required');
    const cleanPhone = (phone || email).trim();
    const cleanName = (name || 'Learner').trim();
    const cleanEmail = (email || cleanPhone).trim().toLowerCase();
    const now = new Date().toISOString();

    const existing = await queryOne('SELECT * FROM users WHERE phone = ? OR LOWER(email) = ?', [cleanPhone, cleanEmail]);
    if (existing) {
        if ((cleanName && cleanName !== existing.name) || (cleanEmail && cleanEmail !== existing.email)) {
            await execute('UPDATE users SET name = ?, email = ? WHERE phone = ?',
                [cleanName || existing.name, cleanEmail || existing.email, existing.phone]);
        }
        return await queryOne('SELECT * FROM users WHERE phone = ?', [existing.phone]);
    }

    await execute('INSERT INTO users (phone, name, email, created_at) VALUES (?, ?, ?, ?)',
        [cleanPhone, cleanName, cleanEmail, now]);
      
    return await queryOne('SELECT * FROM users WHERE phone = ?', [cleanPhone]);
}

async function getUser(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    return await queryOne('SELECT * FROM users WHERE phone = ? OR LOWER(email) = ?', [identifier.trim(), clean]);
}

// ==========================================
// Courses & MCQ Management
// ==========================================

async function getCourse(courseId) {
    const row = await queryOne('SELECT * FROM courses WHERE course_id = ?', [courseId]);
    if (!row) return null;
    return {
        courseId: row.course_id,
        title: row.title,
        author: row.author || 'Karmayogi Bharat',
        category: row.category || 'Course',
        duration: row.duration || '30m',
        masterSummary: row.master_summary,
        status: row.status || 'published',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

async function getAllCourses(includeUnpublished = false) {
    let sql = `
        SELECT 
            c.course_id,
            c.title,
            c.author,
            c.category,
            c.duration,
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

    const rows = await queryAll(sql);
    return rows.map(r => {
        const mcqCount = parseInt(r.mcq_count || '0', 10);
        const submissionCount = parseInt(r.submission_count || '0', 10);
        const summaryLength = parseInt(r.summary_length || '0', 10);
        return {
            courseId: r.course_id,
            title: r.title || r.course_id,
            author: r.author || 'Karmayogi Bharat',
            category: r.category || 'Course',
            duration: r.duration || (mcqCount ? `${mcqCount * 2}m` : '30m'),
            status: r.status || 'published',
            mcqCount: mcqCount,
            hasMCQs: mcqCount > 0,
            submissionCount: submissionCount,
            hasSummary: summaryLength > 0,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        };
    });
}

async function saveCourse({ courseId, title, author = 'Karmayogi Bharat', category = 'Course', duration = '30m', masterSummary, status = 'published' }) {
    const now = new Date().toISOString();
    const existing = await getCourse(courseId);
    if (existing) {
        await execute(`
            UPDATE courses 
            SET title = ?, author = ?, category = ?, duration = ?, master_summary = ?, status = ?, updated_at = ?
            WHERE course_id = ?
        `, [
            title || existing.title || courseId,
            author || existing.author || 'Karmayogi Bharat',
            category || existing.category || 'Course',
            duration || existing.duration || '30m',
            masterSummary !== undefined ? masterSummary : (existing.masterSummary || ''),
            status || existing.status || 'published',
            now,
            courseId
        ]);
    } else {
        await execute(`
            INSERT INTO courses (course_id, title, author, category, duration, master_summary, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [courseId, title || courseId, author, category, duration, masterSummary || '', status, now, now]);
    }
    return await getCourse(courseId);
}

async function updateCourseAndMCQs(courseId, { title, author, category, duration, masterSummary, mcqs, status = 'published' }) {
    const now = new Date().toISOString();
    const existing = await getCourse(courseId);
    
    await execute(`
        UPDATE courses 
        SET title = ?, author = ?, category = ?, duration = ?, master_summary = ?, status = ?, updated_at = ?
        WHERE course_id = ?
    `, [
        title !== undefined ? title : (existing?.title || courseId),
        author !== undefined ? author : (existing?.author || 'Karmayogi Bharat'),
        category !== undefined ? category : (existing?.category || 'Course'),
        duration !== undefined ? duration : (existing?.duration || '30m'),
        masterSummary !== undefined ? masterSummary : (existing?.masterSummary || ''),
        status || 'published',
        now,
        courseId
    ]);

    if (Array.isArray(mcqs)) {
        await saveMCQs(courseId, mcqs);
    }

    return {
        course: await getCourse(courseId),
        mcqs: await getMCQs(courseId)
    };
}

async function getMCQs(courseId) {
    const row = await queryOne('SELECT * FROM mcqs WHERE course_id = ?', [courseId]);
    if (!row || !row.mcqs_json) return null;
    try {
        return typeof row.mcqs_json === 'string' ? JSON.parse(row.mcqs_json) : row.mcqs_json;
    } catch (e) {
        console.error(`Failed to parse MCQs JSON for ${courseId}:`, e);
        return null;
    }
}

async function saveMCQs(courseId, mcqsArray) {
    const now = new Date().toISOString();
    const count = Array.isArray(mcqsArray) ? mcqsArray.length : 0;
    const jsonStr = JSON.stringify(mcqsArray);

    await execute(`
        INSERT INTO mcqs (course_id, mcqs_json, count, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(course_id) DO UPDATE SET
            mcqs_json = excluded.mcqs_json,
            count = excluded.count,
            created_at = excluded.created_at
    `, [courseId, jsonStr, count, now]);

    return await getMCQs(courseId);
}

// ==========================================
// Submissions & Cumulative Analytics
// ==========================================

async function saveSubmission({ id, courseId, phone, learnerName, score, scorePercentage, details, profile }) {
    const cleanPhone = phone ? phone.trim() : null;
    if (cleanPhone) {
        await findOrCreateUser({ phone: cleanPhone, name: learnerName || 'Learner' });
    }

    const subId = id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    
    let calculatedPct = scorePercentage;
    if (calculatedPct === undefined && typeof score === 'string' && score.includes('/')) {
        const [num, den] = score.split('/').map(Number);
        if (den > 0) calculatedPct = Math.round((num / den) * 100);
    }

    await execute(`
        INSERT INTO submissions (
            id, course_id, phone, learner_name, score, score_percentage, details_json, profile_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        subId,
        courseId,
        cleanPhone,
        learnerName || 'Anonymous Learner',
        score || '0/0',
        calculatedPct || 0,
        JSON.stringify(details || []),
        JSON.stringify(profile || {}),
        now
    ]);

    return await getSubmissionById(subId);
}

async function getSubmissionById(id) {
    const row = await queryOne('SELECT * FROM submissions WHERE id = ?', [id]);
    if (!row) return null;
    return {
        id: row.id,
        courseId: row.course_id,
        phone: row.phone,
        learnerName: row.learner_name,
        score: row.score,
        scorePercentage: parseFloat(row.score_percentage || 0),
        details: typeof row.details_json === 'string' ? JSON.parse(row.details_json || '[]') : (row.details_json || []),
        profile: typeof row.profile_json === 'string' ? JSON.parse(row.profile_json || '{}') : (row.profile_json || {}),
        createdAt: row.created_at
    };
}

async function getSubmissions(courseId = null, phone = null) {
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

    const rows = await queryAll(query, params);
    return rows.map(row => ({
        id: row.id,
        courseId: row.course_id,
        phone: row.phone,
        learnerName: row.learner_name,
        score: row.score,
        scorePercentage: parseFloat(row.score_percentage || 0),
        details: typeof row.details_json === 'string' ? JSON.parse(row.details_json || '[]') : (row.details_json || []),
        profile: typeof row.profile_json === 'string' ? JSON.parse(row.profile_json || '{}') : (row.profile_json || {}),
        createdAt: row.created_at
    }));
}

async function saveCumulativeAnalysis(phone, profile, testsCount) {
    const now = new Date().toISOString();
    await execute(`
        INSERT INTO cumulative_analyses (phone, profile_json, tests_analyzed, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(phone) DO UPDATE SET
            profile_json = excluded.profile_json,
            tests_analyzed = excluded.tests_analyzed,
            updated_at = excluded.updated_at
    `, [phone, JSON.stringify(profile), testsCount, now]);

    return await getCumulativeAnalysis(phone);
}

async function getCumulativeAnalysis(phone) {
    const row = await queryOne('SELECT * FROM cumulative_analyses WHERE phone = ?', [phone]);
    if (!row) return null;
    return {
        phone: row.phone,
        profile: typeof row.profile_json === 'string' ? JSON.parse(row.profile_json || '{}') : (row.profile_json || {}),
        testsAnalyzed: parseInt(row.tests_analyzed || '0', 10),
        updatedAt: row.updated_at
    };
}

async function deleteCourse(courseId) {
    await execute('DELETE FROM submissions WHERE course_id = ?', [courseId]);
    await execute('DELETE FROM mcqs WHERE course_id = ?', [courseId]);
    const res = await execute('DELETE FROM courses WHERE course_id = ?', [courseId]);
    return res.changes > 0;
}

// ==========================================
// Case Studies Management (Amrit Gyaan Kosh)
// ==========================================

async function getAllCaseStudies(includeUnpublished = false) {
    let sql = 'SELECT * FROM case_studies';
    if (!includeUnpublished) {
        sql += " WHERE status = 'published' OR status IS NULL";
    }
    sql += ' ORDER BY created_at DESC';
    const rows = await queryAll(sql);
    return rows.map(r => ({
        id: r.id,
        title: r.title,
        author: r.author || 'Capacity Building Commission',
        categories: r.categories_json ? (typeof r.categories_json === 'string' ? JSON.parse(r.categories_json) : r.categories_json) : ['Governance'],
        duration: r.duration || '1h',
        summary: r.summary || '',
        lessons: r.lessons_json ? (typeof r.lessons_json === 'string' ? JSON.parse(r.lessons_json) : r.lessons_json) : [],
        status: r.status || 'published',
        createdAt: r.created_at,
        updatedAt: r.updated_at
    }));
}

async function getCaseStudy(id) {
    const r = await queryOne('SELECT * FROM case_studies WHERE id = ?', [id]);
    if (!r) return null;
    return {
        id: r.id,
        title: r.title,
        author: r.author || 'Capacity Building Commission',
        categories: r.categories_json ? (typeof r.categories_json === 'string' ? JSON.parse(r.categories_json) : r.categories_json) : ['Governance'],
        duration: r.duration || '1h',
        summary: r.summary || '',
        lessons: r.lessons_json ? (typeof r.lessons_json === 'string' ? JSON.parse(r.lessons_json) : r.lessons_json) : [],
        status: r.status || 'published',
        createdAt: r.created_at,
        updatedAt: r.updated_at
    };
}

async function saveCaseStudy({ id, title, author, categories, duration, summary, lessons, status = 'published' }) {
    const now = new Date().toISOString();
    const caseId = id ? id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') : 'cs_' + Date.now();
    
    let categoriesArray = ['Governance'];
    if (Array.isArray(categories)) {
        categoriesArray = categories;
    } else if (typeof categories === 'string' && categories.trim()) {
        categoriesArray = categories.split(',').map(s => s.trim()).filter(Boolean);
    }
    const categoriesJson = JSON.stringify(categoriesArray.length > 0 ? categoriesArray : ['Governance']);

    let lessonsArray = [];
    if (Array.isArray(lessons)) {
        lessonsArray = lessons;
    } else if (typeof lessons === 'string' && lessons.trim()) {
        lessonsArray = lessons.split('\n').map(s => s.trim()).filter(Boolean);
    }
    const lessonsJson = JSON.stringify(lessonsArray);

    const existing = await getCaseStudy(caseId);
    if (existing) {
        await execute(`
            UPDATE case_studies 
            SET title = ?, author = ?, categories_json = ?, duration = ?, summary = ?, lessons_json = ?, status = ?, updated_at = ?
            WHERE id = ?
        `, [
            title || existing.title,
            author || existing.author || 'Capacity Building Commission',
            categoriesJson,
            duration || existing.duration || '1h',
            summary !== undefined ? summary : existing.summary,
            lessonsJson,
            status || existing.status || 'published',
            now,
            caseId
        ]);
    } else {
        await execute(`
            INSERT INTO case_studies (id, title, author, categories_json, duration, summary, lessons_json, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            caseId,
            title || 'Untitled Case Study',
            author || 'Capacity Building Commission',
            categoriesJson,
            duration || '1h',
            summary || '',
            lessonsJson,
            status || 'published',
            now,
            now
        ]);
    }
    return await getCaseStudy(caseId);
}

async function deleteCaseStudy(id) {
    const res = await execute('DELETE FROM case_studies WHERE id = ?', [id]);
    return res.changes > 0;
}

// Database stats for Admin Dashboard
async function getDatabaseStats() {
    await ensureInitialized();
    const coursesCount = parseInt((await rawQueryOne('SELECT COUNT(*) as c FROM courses'))?.c || '0', 10);
    const caseStudiesCount = parseInt((await rawQueryOne('SELECT COUNT(*) as c FROM case_studies'))?.c || '0', 10);
    const mcqsCount = parseInt((await rawQueryOne('SELECT COUNT(*) as c FROM mcqs'))?.c || '0', 10);
    const submissionsCount = parseInt((await rawQueryOne('SELECT COUNT(*) as c FROM submissions'))?.c || '0', 10);
    const usersCount = parseInt((await rawQueryOne('SELECT COUNT(*) as c FROM users'))?.c || '0', 10);
    const adminsCount = parseInt((await rawQueryOne('SELECT COUNT(*) as c FROM admins'))?.c || '0', 10);

    let providerInfo = 'SQLite (Local File)';
    let dbLocation = DB_PATH;

    if (isPg) {
        try {
            const parsed = new URL(connectionString);
            providerInfo = `PostgreSQL (Render Cloud - ${parsed.hostname})`;
            dbLocation = `Database: ${parsed.pathname.replace('/', '')}`;
        } catch (_) {
            providerInfo = 'PostgreSQL (Render Cloud)';
            dbLocation = 'Render Cloud Managed DB';
        }
    }

    return {
        provider: providerInfo,
        coursesCount,
        caseStudiesCount,
        mcqsCount,
        submissionsCount,
        usersCount,
        adminsCount,
        dbPath: dbLocation
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
    registerUser,
    verifyUserCredentials,
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
    getAllCaseStudies,
    getCaseStudy,
    saveCaseStudy,
    deleteCaseStudy,
    getDatabaseStats
};
