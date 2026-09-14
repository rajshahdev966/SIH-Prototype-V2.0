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

// ==========================================
// Security Middleware: Strict Admin Auth
// ==========================================

function requireAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication token required' });
    }

    const admin = db.validateAdminSession(authHeader);
    if (!admin) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired admin session. Please log in again.' });
    }

    req.admin = admin;
    next();
}

// ==========================================
// 1. Admin Authentication & Administration
// ==========================================

// Admin Login
app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const admin = db.verifyAdminCredentials(username, password);
        if (!admin) {
            return res.status(401).json({ success: false, error: 'Invalid administrative credentials' });
        }

        const token = db.createAdminSession(admin.username);
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
app.put('/api/admin/profile', requireAdminAuth, (req, res) => {
    try {
        const { email, password } = req.body;
        const updated = db.updateAdminProfile(req.admin.username, { email, password });
        console.log(`[Admin Security] Admin "${req.admin.username}" updated credentials.`);
        res.json({ success: true, admin: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Create Another Admin
app.post('/api/admin/create-admin', requireAdminAuth, (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newAdmin = db.createNewAdmin({ username, email, password });
        console.log(`[Admin Security] New admin created: "${username}" by "${req.admin.username}"`);
        res.json({ success: true, admin: newAdmin });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Admin List All Admins
app.get('/api/admin/list', requireAdminAuth, (req, res) => {
    try {
        const admins = db.getAllAdmins();
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) db.revokeAdminSession(authHeader);
    res.json({ success: true, message: 'Logged out successfully' });
});

// Admin Database & System Overview
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
    try {
        const stats = db.getDatabaseStats();
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

        const existingCourse = db.getCourse(courseId);
        const existingMCQs = db.getMCQs(courseId);

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

        db.saveCourse({
            courseId: courseId,
            title: courseTitle,
            masterSummary: masterSummary,
            status: 'published'
        });

        const mcqs = await generateMCQs(masterSummary);
        db.saveMCQs(courseId, mcqs);

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
app.put('/api/admin/courses/:courseId', requireAdminAuth, (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, author, category, duration, masterSummary, mcqs, status } = req.body;

        const updated = db.updateCourseAndMCQs(courseId, {
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
app.delete('/api/courses/:courseId', requireAdminAuth, (req, res) => {
    try {
        const { courseId } = req.params;
        const deleted = db.deleteCourse(courseId);
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

// Learner Login / Register (Phone, Name, Email)
app.post('/api/auth/login', (req, res) => {
    try {
        const { phone, name, email } = req.body;
        if (!phone || !phone.trim()) {
            return res.status(400).json({ success: false, error: 'Phone number is required' });
        }

        const user = db.findOrCreateUser({
            phone: phone.trim(),
            name: name ? name.trim() : 'Civil Servant Learner',
            email: email ? email.trim() : ''
        });

        res.json({ success: true, user });
    } catch (error) {
        console.error('[Learner Auth Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Learner Profile & Test History
app.get('/api/user/:phone/profile', (req, res) => {
    try {
        const { phone } = req.params;
        const user = db.getUser(phone);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const submissions = db.getSubmissions(null, phone);
        const cumulativeAnalysis = db.getCumulativeAnalysis(phone);

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
        const user = db.getUser(phone);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const submissions = db.getSubmissions(null, phone);
        console.log(`[Cumulative Agent] Analyzing ${submissions.length} tests for ${user.name}...`);

        const profile = await analyzeCumulativeProfile(submissions, user);
        const saved = db.saveCumulativeAnalysis(phone, profile, submissions.length);

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
app.get('/api/case-studies', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const isAdmin = authHeader && !!db.validateAdminSession(authHeader);
        const caseStudies = db.getAllCaseStudies(isAdmin);
        res.json({ success: true, caseStudies });
    } catch (error) {
        console.error('[API] Error fetching case studies:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Single Case Study Detail Endpoint
app.get('/api/case-studies/:id', (req, res) => {
    try {
        const { id } = req.params;
        const caseStudy = db.getCaseStudy(id);
        if (!caseStudy) {
            return res.status(404).json({ success: false, error: 'Case study not found' });
        }
        res.json({ success: true, caseStudy });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Create Case Study
app.post('/api/admin/case-studies', requireAdminAuth, (req, res) => {
    try {
        const { id, title, author, categories, duration, summary, lessons, status } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }
        const created = db.saveCaseStudy({ id, title, author, categories, duration, summary, lessons, status });
        console.log(`[Admin] Case study "${created.id}" created by "${req.admin.username}".`);
        res.json({ success: true, caseStudy: created });
    } catch (error) {
        console.error('[Admin Case Study Create Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Update Case Study
app.put('/api/admin/case-studies/:id', requireAdminAuth, (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, categories, duration, summary, lessons, status } = req.body;
        const updated = db.saveCaseStudy({ id, title, author, categories, duration, summary, lessons, status });
        console.log(`[Admin] Case study "${id}" updated by "${req.admin.username}".`);
        res.json({ success: true, caseStudy: updated });
    } catch (error) {
        console.error('[Admin Case Study Update Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Delete Case Study
app.delete('/api/admin/case-studies/:id', requireAdminAuth, (req, res) => {
    try {
        const { id } = req.params;
        const deleted = db.deleteCaseStudy(id);
        console.log(`[Admin] Case study "${id}" deleted by "${req.admin.username}".`);
        res.json({ success: true, deleted });
    } catch (error) {
        console.error('[Admin Case Study Delete Error]:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Public Course Catalog (Only returns published courses)
app.get('/api/courses', (req, res) => {
    try {
        // Only return all if valid admin session is provided
        const authHeader = req.headers.authorization;
        const isAdmin = authHeader && !!db.validateAdminSession(authHeader);
        const courses = db.getAllCourses(isAdmin);
        res.json({ success: true, courses });
    } catch (error) {
        console.error('[API] Error fetching courses:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Public Course Detail (Summary & MCQs)
app.get('/api/courses/:courseId', (req, res) => {
    try {
        const { courseId } = req.params;
        const course = db.getCourse(courseId);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }
        const mcqs = db.getMCQs(courseId) || [];
        const submissions = db.getSubmissions(courseId);

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

        const savedSubmission = db.saveSubmission({
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
                    const user = db.getUser(phone);
                    const allSubs = db.getSubmissions(null, phone);
                    const cumulative = await analyzeCumulativeProfile(allSubs, user);
                    db.saveCumulativeAnalysis(phone, cumulative, allSubs.length);
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
