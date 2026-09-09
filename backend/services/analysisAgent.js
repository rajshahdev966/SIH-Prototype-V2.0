const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ANALYSIS_PROMPT = `You are an expert educational data analyst. You are provided with a JSON file containing the results of a student's quiz.
The quiz contains both theoretical questions and application-based scenarios.
The JSON includes whether they got it right, the topic, the question type, and the time spent before answering (in seconds).

Your task is to analyze these results and generate a structured "Competency Profile".
Pay attention to:
- Which topics they consistently got wrong (Knowledge Gaps).
- Which topics they got right quickly vs. slowly.
- Whether they struggle more with 'theoretical' or 'application' questions.

Return your entire response as a single valid JSON object following this exact schema, without any markdown formatting blocks like \`\`\`json around it.
{
  "overall_proficiency": "Novice | Competent | Expert",
  "score": "The score string from the input",
  "theoretical_score_percentage": 0,
  "application_score_percentage": 0,
  "strengths": ["List of topics they did well in"],
  "knowledge_gaps": ["List of topics they failed or struggled with"],
  "time_management_analysis": "A brief analysis of their answering speed based on the time_spent_seconds data.",
  "remediation_plan": "A concise paragraph giving actionable advice on what to study next based on the gaps."
}`;

// Deterministic heuristic fallback in case of Gemini temporary 503 high demand
function generateAlgorithmicProfile(quizResults) {
    const details = quizResults.details || [];
    const theoryItems = details.filter(d => (d.type || '').toLowerCase() === 'theoretical');
    const appItems = details.filter(d => (d.type || '').toLowerCase() === 'application');

    const theoryCorrect = theoryItems.filter(d => d.is_correct).length;
    const appCorrect = appItems.filter(d => d.is_correct).length;

    const theoryPct = theoryItems.length > 0 ? Math.round((theoryCorrect / theoryItems.length) * 100) : 0;
    const appPct = appItems.length > 0 ? Math.round((appCorrect / appItems.length) * 100) : 0;

    const totalCorrect = details.filter(d => d.is_correct).length;
    const totalPct = details.length > 0 ? Math.round((totalCorrect / details.length) * 100) : 0;

    let proficiency = 'Competent';
    if (totalPct >= 80) proficiency = 'Expert';
    else if (totalPct < 50) proficiency = 'Novice';

    const strengths = [...new Set(details.filter(d => d.is_correct && d.topic).map(d => d.topic))];
    const gaps = [...new Set(details.filter(d => !d.is_correct && d.topic).map(d => d.topic))];

    const avgTime = details.length > 0 
        ? Math.round(details.reduce((acc, d) => acc + (d.time_spent_seconds || 5), 0) / details.length)
        : 5;

    let timeAnalysis = `Average response time was ${avgTime} seconds per question. `;
    if (avgTime < 6) {
        timeAnalysis += `Rapid answering pace indicates high confidence across familiar domains.`;
    } else if (avgTime > 15) {
        timeAnalysis += `Deliberate and careful answering pace; recommend practicing speed on core definitions.`;
    } else {
        timeAnalysis += `Well-balanced pacing between theoretical recall and scenario assessment.`;
    }

    let remediation = gaps.length > 0
        ? `Focus review on ${gaps.slice(0, 3).join(', ')}. Re-read the foundational principles in the Structured Learning Document and practice real-world situational cases.`
        : `Outstanding mastery demonstrated across all tested competencies. Continue applying these principles to complex organizational scenarios.`;

    return {
        overall_proficiency: proficiency,
        score: quizResults.score || `${totalCorrect}/${details.length}`,
        theoretical_score_percentage: theoryPct,
        application_score_percentage: appPct,
        strengths: strengths.length > 0 ? strengths : ['General Course Concepts'],
        knowledge_gaps: gaps,
        time_management_analysis: timeAnalysis,
        remediation_plan: remediation
    };
}

async function analyzeResults(quizResults) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');
    if (!quizResults || !quizResults.details) throw new Error('Valid Quiz results JSON is required');

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-1.5-flash'];

    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [
                    { text: ANALYSIS_PROMPT },
                    { text: `Here are the Quiz Results:\n\n${JSON.stringify(quizResults, null, 2)}` }
                ],
                config: { responseMimeType: 'application/json' }
            });

            if (response && response.text) {
                const parsed = JSON.parse(response.text);
                return parsed;
            }
        } catch (e) {
            console.warn(`[AnalysisAgent] Model ${modelName} encountered error: ${e.message}. Trying next option...`);
        }
    }

    console.log('[AnalysisAgent] Generating robust deterministic profile fallback...');
    return generateAlgorithmicProfile(quizResults);
}

module.exports = {
    analyzeResults
};
