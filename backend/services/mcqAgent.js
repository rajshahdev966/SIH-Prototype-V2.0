const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MCQ_PROMPT = `You are an expert instructional designer and assessment creator. 
You are provided with a "Structured Learning Document" that contains a highly detailed summary of a course module. 
Your task is to generate exactly 15 Multiple Choice Questions (MCQs) based SOLELY on this document.

Follow these strict rules:
1. The first 10 MCQs MUST focus purely on theoretical aspects, facts, and definitions found directly in the document.
2. The next 5 MCQs MUST be application-based scenarios. You must invent realistic scenarios where the concepts from the document are applied, and the user must choose the correct response for that scenario based on the rules in the document.
3. Do not invent facts outside of the provided learning document.
4. Your explanation must be concise 

Return your entire response as a single valid JSON object following this exact schema, without any markdown formatting blocks like \`\`\`json around it.
{
  "mcqs": [
    {
      "question": "Question text here (or scenario description)",
      "type": "theoretical | application",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Exact text of the correct option",
      "explanation": "Why this is correct based on the provided document.",
      "difficulty": "Easy|Medium|Hard",
      "topic": "Topic category"
    }
  ]
}`;

async function generateMCQs(learningDocument) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');
    if (!learningDocument) throw new Error('Learning document is required');

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
            { text: MCQ_PROMPT },
            { text: `Here is the Structured Learning Document:\n\n${learningDocument}` }
        ],
        config: { responseMimeType: "application/json" }
    });

    try {
        const parsed = JSON.parse(response.text);
        return parsed.mcqs;
    } catch (e) {
        throw new Error('Failed to parse Gemini MCQ response into JSON');
    }
}

module.exports = {
    generateMCQs
};
