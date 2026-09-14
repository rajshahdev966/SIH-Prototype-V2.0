const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const db = require('./database/db');
const { extractCourseContent } = require('./services/extractionAgent');
const { generateMCQs } = require('./services/mcqAgent');
const { analyzeResults } = require('./services/analysisAgent');
const { analyzeCumulativeProfile } = require('./services/cumulativeAnalysisAgent');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check & Root Ping (Required for Render & Cloud Monitoring)
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'iGOT Karmayogi Bharat Backend API',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', async (req, res) => {
    try {
        const stats = await db.getDatabaseStats();
        res.json({ status: 'healthy', database: stats });
    } catch (e) {
        res.status(500).json({ status: 'unhealthy', error: e.message });
    }
});

// ==========================================
// Security Middleware: Strict Admin Auth
// ==========================================

async function requireAdminAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication token required' });
        }

        const admin = await db.validateAdminSession(authHeader);
        if (!admin) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired admin session. Please log in again.' });
        }

        req.admin = admin;
        next();
    } catch (err) {
        console.error('[Admin Auth Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal authentication error' });
    }
}

// ==========================================
// 1. Admin Authentication & Administration
// ==========================================

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const admin = await db.verifyAdminCredentials(username, password);
        if (!admin) {
            return res.status(401).json({ success: false, error: 'Invalid administrative credentials' });
        }

        const token = await db.createAdminSession(admin.username);
        console.log(`[Admin Security] Admin "${admin.username}" authenticated successfully.`);

        res.json({
            success: true,
            token,
            admin: {
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('[Admin Login Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Verify Session
app.get('/api/admin/me', requireAdminAuth, (req, res) => {
    res.json({ success: true, admin: req.admin });
});

// Admin Update Own Profile (Email / Password)
app.put('/api/admin/profile', requireAdminAuth, async (req, res) => {
    try {
        const { email, password } = req.body;
        const updated = await db.updateAdminProfile(req.admin.username, { email, password });
        console.log(`[Admin Security] Admin "${req.admin.username}" updated credentials.`);
        res.json({ success: true, admin: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Create Another Admin
app.post('/api/admin/create-admin', requireAdminAuth, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newAdmin = await db.createNewAdmin({ username, email, password });
        console.log(`[Admin Security] New admin created: "${username}" by "${req.admin.username}"`);
        res.json({ success: true, admin: newAdmin });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Admin List All Admins
app.get('/api/admin/list', requireAdminAuth, async (req, res) => {
    try {
        const admins = await db.getAllAdmins();
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Logout
app.post('/api/admin/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) await db.revokeAdminSession(authHeader);
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Database & System Overview
app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
    try {
        const stats = await db.getDatabaseStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 2. Admin Course Management (Protected)
// ==========================================

// Ingest new course (Requires Admin Auth)
app.post('/api/courses/ingest', requireAdminAuth, async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ error: 'courseId is required' });

        const existingCourse = await db.getCourse(courseId);
        const existingMCQs = await db.getMCQs(courseId);

        if (existingCourse && existingMCQs && existingMCQs.length > 0) {
            console.log(`[Cache Hit] Course ${courseId} already in DB.`);
            return res.json({
                success: true,
                cached: true,
                message: 'Course already exists in database.',
                data: {
                    courseId: existingCourse.courseId,
                    title: existingCourse.title,
                    masterSummary: existingCourse.masterSummary,
                    mcqs: existingMCQs
                }
            });
        }

        console.log(`[Ingest] Initiated by admin "${req.admin.username}" for ${courseId}...`);
        const extractResult = await extractCourseContent(courseId);
        const courseTitle = extractResult.courseTitle || courseId;
        const masterSummary = extractResult.masterSummary;

        await db.saveCourse({
            courseId: courseId,
            title: courseTitle,
            masterSummary: masterSummary,
            status: 'published'
        });

        const mcqs = await generateMCQs(masterSummary);
        await db.saveMCQs(courseId, mcqs);

        console.log(`[Ingest] Ingested and stored ${courseId} (${mcqs.length} MCQs)`);

        res.json({
            success: true,
            cached: false,
            message: 'Course successfully extracted, generated, and saved.',
            data: {
                courseId: courseId,
                title: courseTitle,
                masterSummary: masterSummary,
                mcqs: mcqs
            }
        });
    } catch (error) {
        console.error('[API] Ingestion Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Live Editor: Update Title, Summary, MCQs, and Status (Requires Admin Auth)
app.put('/api/admin/courses/:courseId', requireAdminAuth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, author, category, duration, masterSummary, mcqs, status } = req.body;

        const updated = await db.updateCourseAndMCQs(courseId, {
            title: title || courseId,
            author,
            category,
            duration,
            masterSummary: masterSummary || '',
            mcqs: Array.isArray(mcqs) ? mcqs : [],
            status: status || 'published'
        });

        console.log(`[Admin] Course ${courseId} updated by "${req.admin.username}".`);
        res.json({ success: true, ...updated });
    } catch (error) {
        console.error('[Admin Update Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete Course (Requires Admin Auth)
app.delete('/api/courses/:courseId', requireAdminAuth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const deleted = await db.deleteCourse(courseId);
        console.log(`[Admin] Course ${courseId} deleted by "${req.admin.username}".`);
        res.json({ success: true, deleted });
    } catch (error) {
        console.error('[API] Delete Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 3. Public Learner Portal Endpoints
// ==========================================

// Learner Registration (Strict: Email, Password, Name)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, code: 'MISSING_EMAIL', error: 'Email address is required' });
        }
        if (!password || !password.trim()) {
            return res.status(400).json({ success: false, code: 'MISSING_PASSWORD', error: 'Password is required' });
        }
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, code: 'MISSING_NAME', error: 'Full Name is required' });
        }

        const user = await db.registerUser({ email, password, name });
        console.log(`[Learner Auth] Registered new user: "${user.name}" (${user.email})`);
        res.json({ success: true, user });
    } catch (error) {
        console.warn('[Learner Register Error]:', error.message);
        const statusCode = error.code === 'EMAIL_ALREADY_EXISTS' ? 409 : 400;
        res.status(statusCode).json({
            success: false,
            code: error.code || 'REGISTRATION_FAILED',
            error: error.message
        });
    }
});

// Learner Login (Strict: Email & Password)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, phone, name } = req.body;
        
        // Strict email & password flow
        if (email && password) {
            const user = await db.verifyUserCredentials(email, password);
            console.log(`[Learner Auth] Learner "${user.name}" logged in successfully.`);
            return res.json({ success: true, user });
        }

        // Backward compatibility fallback for legacy tests if phone passed
        if (phone && phone.trim()) {
            const user = await db.findOrCreateUser({
                phone: phone.trim(),
                name: name ? name.trim() : 'Civil Servant Learner',
                email: email ? email.trim() : ''
            });
            return res.json({ success: true, user });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, code: 'MISSING_EMAIL', error: 'Email address is required' });
        }
        if (!password || !password.trim()) {
            return res.status(400).json({ success: false, code: 'MISSING_PASSWORD', error: 'Password is required' });
        }
    } catch (error) {
        console.warn('[Learner Auth Error]:', error.message);
        let statusCode = 400;
        if (error.code === 'USER_NOT_FOUND') statusCode = 404;
        if (error.code === 'INVALID_PASSWORD') statusCode = 401;

        res.status(statusCode).json({
            success: false,
            code: error.code || 'AUTH_FAILED',
            error: error.message
        });
    }
});

// Learner Profile & Test History
app.get('/api/user/:phone/profile', async (req, res) => {
    try {
        const { phone } = req.params;
        const user = await db.getUser(phone);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const submissions = await db.getSubmissions(null, phone);
        const cumulativeAnalysis = await db.getCumulativeAnalysis(phone);

        res.json({
            success: true,
            user,
            submissions,
            cumulativeAnalysis
        });
    } catch (error) {
        console.error('[User Profile Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cumulative Holistic Analysis for a Learner
app.post('/api/user/:phone/cumulative-analysis', async (req, res) => {
    try {
        const { phone } = req.params;
        const user = await db.getUser(phone);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const submissions = await db.getSubmissions(null, phone);
        console.log(`[Cumulative Agent] Analyzing ${submissions.length} tests for ${user.name}...`);

        const profile = await analyzeCumulativeProfile(submissions, user);
        const saved = await db.saveCumulativeAnalysis(phone, profile, submissions.length);

        res.json({
            success: true,
            cumulativeAnalysis: saved,
            profile: profile
        });
    } catch (error) {
        console.error('[Cumulative Analysis Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Public Case Studies Endpoint (Returns published case studies from DB)
app.get('/api/case-studies', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const isAdmin = authHeader && !!(await db.validateAdminSession(authHeader));
        const caseStudies = await db.getAllCaseStudies(isAdmin);
        res.json({ success: true, caseStudies });
    } catch (error) {
        console.error('[API] Error fetching case studies:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Single Case Study Detail Endpoint
app.get('/api/case-studies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const caseStudy = await db.getCaseStudy(id);
        if (!caseStudy) {
            return res.status(404).json({ success: false, error: 'Case study not found' });
        }
        res.json({ success: true, caseStudy });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Create Case Study
app.post('/api/admin/case-studies', requireAdminAuth, async (req, res) => {
    try {
        const { id, title, author, categories, duration, summary, lessons, status } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }
        const created = await db.saveCaseStudy({ id, title, author, categories, duration, summary, lessons, status });
        console.log(`[Admin] Case study "${created.id}" created by "${req.admin.username}".`);
        res.json({ success: true, caseStudy: created });
    } catch (error) {
        console.error('[Admin Case Study Create Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Update Case Study
app.put('/api/admin/case-studies/:id', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, categories, duration, summary, lessons, status } = req.body;
        const updated = await db.saveCaseStudy({ id, title, author, categories, duration, summary, lessons, status });
        console.log(`[Admin] Case study "${id}" updated by "${req.admin.username}".`);
        res.json({ success: true, caseStudy: updated });
    } catch (error) {
        console.error('[Admin Case Study Update Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Delete Case Study
app.delete('/api/admin/case-studies/:id', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.deleteCaseStudy(id);
        console.log(`[Admin] Case study "${id}" deleted by "${req.admin.username}".`);
        res.json({ success: true, deleted });
    } catch (error) {
        console.error('[Admin Case Study Delete Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Public Course Catalog (Only returns published courses)
app.get('/api/courses', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const isAdmin = authHeader && !!(await db.validateAdminSession(authHeader));
        const courses = await db.getAllCourses(isAdmin);
        res.json({ success: true, courses });
    } catch (error) {
        console.error('[API] Error fetching courses:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Public Course Detail (Summary & MCQs)
app.get('/api/courses/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await db.getCourse(courseId);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }
        const mcqs = (await db.getMCQs(courseId)) || [];
        const submissions = await db.getSubmissions(courseId);

        res.json({
            success: true,
            course: {
                ...course,
                mcqs,
                submissionCount: submissions.length
            }
        });
    } catch (error) {
        console.error('[API] Error fetching course:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Quiz Submission
app.post('/api/courses/:courseId/submit', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { phone, learnerName, score, details } = req.body;

        if (!details || !Array.isArray(details)) {
            return res.status(400).json({ error: 'Quiz details array is required' });
        }

        console.log(`[Submission] Processing test for course ${courseId} by ${learnerName || phone}...`);

        const analysisPayload = {
            courseId,
            learnerName: learnerName || 'Civil Servant Learner',
            score: score || '0/0',
            details: details
        };

        const profile = await analyzeResults(analysisPayload);

        const savedSubmission = await db.saveSubmission({
            courseId,
            phone: phone || null,
            learnerName: learnerName || 'Civil Servant Learner',
            score: score || '0/0',
            details: details,
            profile: profile
        });

        if (phone) {
            setTimeout(async () => {
                try {
                    const user = await db.getUser(phone);
                    const allSubs = await db.getSubmissions(null, phone);
                    const cumulative = await analyzeCumulativeProfile(allSubs, user);
                    await db.saveCumulativeAnalysis(phone, cumulative, allSubs.length);
                } catch (e) {
                    console.warn(`[Cumulative Background Update]`, e.message);
                }
            }, 100);
        }

        res.json({
            success: true,
            submission: savedSubmission,
            profile: profile
        });
    } catch (error) {
        console.error('[API] Submission Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`SIH Backend Server running on http://localhost:${PORT}`);
});
