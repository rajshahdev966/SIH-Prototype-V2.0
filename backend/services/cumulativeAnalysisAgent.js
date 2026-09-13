const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CUMULATIVE_PROMPT = `You are an elite educational psychologist and senior civil service competency auditor.
You are provided with the complete historical assessment record of a civil servant across multiple learning modules on the iGOT Karmayogi platform.

Your mission is to perform a deep, longitudinal, cross-course competency synthesis. Do NOT merely repeat one test; synthesize their holistic trajectory across ALL provided tests.

Analyze:
1. Overall Mastery Trajectory: Are they improving, consistently high, or plateauing?
2. Deep Cognitive Strengths: Concepts, principles, or scenario types they repeatedly excel in across courses.
3. Persistent Blind Spots: Systemic knowledge gaps, tricky nuances, or recurring errors that span multiple tests.
4. Cognitive Pacing & Time Profile: Speed vs accuracy correlation across their assessment history.
5. Cross-Domain Synthesis: How effectively they bridge factual theory with administrative scenario execution.
6. Holistic Career Remediation Roadmap: Strategic, high-impact guidance for their professional development.

Return your entire response as a single valid JSON object following this exact schema, without any markdown formatting blocks like \`\`\`json around it.
{
  "longitudinal_proficiency": "Emerging Talent | Proficient Practitioner | Distinguished Expert",
  "trajectory_summary": "1-2 sentences summarizing their overall growth curve across tests.",
  "average_score_percentage": 0,
  "tests_completed": 0,
  "overarching_strengths": ["Strong core principles", "Scenario decision making", "..."],
  "persistent_blind_spots": ["Detailed statutory deadlines", "Complex edge cases", "..."],
  "cognitive_pacing_profile": "Analysis of their time management and answering speed across tests.",
  "cross_domain_synthesis": "Detailed synthesis of their competency across theoretical rules vs real-world practical application.",
  "holistic_remediation_roadmap": "A strategic, actionable paragraph outlining the exact modules and behavioral skills to target next."
}`;

// Deterministic heuristic fallback in case of API rate-limiting or network outage
function generateAlgorithmicCumulativeProfile(submissions, user) {
    const totalTests = submissions.length; 
    if (totalTests === 0) {
        return {
            longitudinal_proficiency: 'Emerging Talent',
            trajectory_summary: 'No assessments completed yet.',
            average_score_percentage: 0,
            tests_completed: 0,
            overarching_strengths: ['Eager Learner'],
            persistent_blind_spots: ['Initial assessment pending'],
            cognitive_pacing_profile: 'N/A',
            cross_domain_synthesis: 'Complete your first course assessment to generate a competency profile.',
            holistic_remediation_roadmap: 'Select any course from the catalog to begin your learning journey.'
        };
    }

    const avgScore = Math.round(submissions.reduce((acc, s) => acc + (s.scorePercentage || 0), 0) / totalTests);
    
    let proficiency = 'Proficient Practitioner';
    if (avgScore >= 85) proficiency = 'Distinguished Expert';
    else if (avgScore < 60) proficiency = 'Emerging Talent';

    // Collect all strengths and gaps across all tests
    const allStrengths = [];
    const allGaps = [];
    let totalTime = 0;
    let totalQuestions = 0;

    submissions.forEach(sub => {
        if (sub.profile?.strengths) allStrengths.push(...sub.profile.strengths);
        if (sub.profile?.knowledge_gaps) allGaps.push(...sub.profile.knowledge_gaps);
        if (Array.isArray(sub.details)) {
            sub.details.forEach(d => {
                totalTime += (d.time_spent_seconds || 5);
                totalQuestions++;
            });
        }
    });

    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
    const uniqueGaps = [...new Set(allGaps)].slice(0, 5);
    const avgPacing = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 6;

    return {
        longitudinal_proficiency: proficiency,
        trajectory_summary: `Completed ${totalTests} assessment(s) with an overall mean score of ${avgScore}%. Demonstrates steady comprehension across core principles.`,
        average_score_percentage: avgScore,
        tests_completed: totalTests,
        overarching_strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ['General Regulatory Awareness', 'Foundational Concepts'],
        persistent_blind_spots: uniqueGaps.length > 0 ? uniqueGaps : ['Procedural nuances under tight timelines'],
        cognitive_pacing_profile: `Maintains an average response velocity of ${avgPacing} seconds per question across all evaluations, indicating balanced deliberation.`,
        cross_domain_synthesis: `The learner shows strong foundational grasp of governance regulations with balanced performance between theoretical comprehension and situational execution.`,
        holistic_remediation_roadmap: uniqueGaps.length > 0
            ? `Prioritize targeted revisions in: ${uniqueGaps.join(', ')}. Review the Structured Learning Documents and practice scenario-based problem solving to elevate overall proficiency.`
            : `Maintain consistent mastery by tackling advanced cross-departmental modules and peer-mentoring initiatives.`
    };
}

async function analyzeCumulativeProfile(submissions, user) {
    if (!submissions || submissions.length === 0) {
        return generateAlgorithmicCumulativeProfile([], user);
    }

    if (!process.env.GEMINI_API_KEY) {
        return generateAlgorithmicCumulativeProfile(submissions, user);
    }

    // Summarize submission history for AI prompt
    const historicalPayload = {
        learner: {
            name: user?.name || 'Learner',
            phone: user?.phone || 'N/A',
            email: user?.email || 'N/A'
        },
        totalSubmissions: submissions.length,
        submissions: submissions.map((s, idx) => ({
            testNumber: idx + 1,
            courseId: s.courseId,
            score: s.score,
            scorePercentage: s.scorePercentage,
            submittedAt: s.createdAt,
            overallProficiency: s.profile?.overall_proficiency,
            theoreticalScorePct: s.profile?.theoretical_score_percentage,
            applicationScorePct: s.profile?.application_score_percentage,
            strengths: s.profile?.strengths || [],
            knowledgeGaps: s.profile?.knowledge_gaps || [],
            timeAnalysis: s.profile?.time_management_analysis
        }))
    };

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-1.5-flash'];

    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [
                    { text: CUMULATIVE_PROMPT },
                    { text: `Here is the complete learner history:\n\n${JSON.stringify(historicalPayload, null, 2)}` }
                ],
                config: { responseMimeType: 'application/json' }
            });

            if (response && response.text) {
                const parsed = JSON.parse(response.text);
                parsed.tests_completed = submissions.length;
                return parsed;
            }
        } catch (e) {
            console.warn(`[CumulativeAgent] Model ${modelName} error: ${e.message}. Retrying...`);
        }
    }

    console.log('[CumulativeAgent] Using resilient algorithmic fallback...');
    return generateAlgorithmicCumulativeProfile(submissions, user);
}

module.exports = {
    analyzeCumulativeProfile
};
