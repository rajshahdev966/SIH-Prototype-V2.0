const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

// Set FFmpeg path (Keep this configured for your Windows machine)
ffmpeg.setFfmpegPath('C:\\Users\\Raj Shah\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffmpeg.exe');
const { GoogleGenAI } = require('@google/genai');

const TEMP_DIR = path.join(__dirname, '../temp_files');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The Final Prompt instructions for the AI Agent
const SUMMARY_PROMPT = `You are an expert instructional designer and teacher. You are provided with the raw transcribed text from several course modules (videos and PDFs).
Generate a comprehensive and highly detailed "Structured Learning Document" that summarizes the core concepts, definitions, and key takeaways from the provided text in Markdown format. 
This summary must be extremely detailed as it will be used later as the sole knowledge base for generating rigorous assessments.

Return your entire response as a single valid JSON object following this exact schema, without any markdown formatting blocks like \`\`\`json around it.
{
  "learning_document": "Markdown string containing the comprehensive summary, key concepts, definitions, and any important lists or frameworks discussed."
}`;

async function getCourseAssets(courseId) {
    const url = `https://portal.igotkarmayogi.gov.in/api/course/v1/hierarchy/${courseId}?hierarchyType=detail`;
    try {
        const response = await axios.get(url);
        const content = response.data.result?.content || {};
        const courseTitle = content.name || `Course ${courseId}`;
        const assets = [];
        function traverse(node) {
            if ((node.mimeType === 'video/mp4' || node.mimeType === 'application/pdf') && node.artifactUrl) {
                assets.push({ name: node.name, url: node.artifactUrl, mimeType: node.mimeType });
            }
            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(traverse);
            }
        }
        traverse(content);
        return { courseTitle, assets };
    } catch (e) {
        throw new Error(`Failed to fetch course: ${e.message}`);
    }
}

async function downloadFile(url, outputPath) {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    const response = await axios({ method: 'GET', url: url, responseType: 'stream' });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function extractAudio(inputPath, outputPath) {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath).toFormat('mp3').on('end', resolve).on('error', reject).save(outputPath);
    });
}

async function waitForProcessing(fileName) {
    let fileInfo = await ai.files.get({ name: fileName });
    while (fileInfo.state === 'PROCESSING') {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        fileInfo = await ai.files.get({ name: fileName });
    }
    if (fileInfo.state === 'FAILED') throw new Error('File processing failed in Gemini.');
}

async function transcribeAsset(filePath, mimeType, assetName) {
    console.log(`Uploading ${assetName} to Gemini for transcription...`);
    const uploadResult = await ai.files.upload({ file: filePath, mimeType: mimeType });
    await waitForProcessing(uploadResult.name);

    const prompt = mimeType === 'application/pdf' 
        ? "Extract and return ALL the raw text from this PDF document. Do not summarize, just transcribe the text exactly as it appears. Return ONLY plain text."
        : "Provide a complete and accurate transcription of this audio. Return ONLY the raw transcript text, no formatting, no markdown.";

    console.log(`Generating transcript for ${assetName}...`);
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
            { fileData: { mimeType: uploadResult.mimeType, fileUri: uploadResult.uri } },
            { text: prompt }
        ]
    });
    return response.text;
}

// Extract content for ALL videos/pdfs in the course
async function extractCourseContent(courseId) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');
    
    const { courseTitle, assets } = await getCourseAssets(courseId);
    let combinedTranscripts = '';
    
    // Process up to 2 assets for the hackathon prototype to save time
    const assetsToProcess = assets.slice(0, 2); 

    for (let i = 0; i < assetsToProcess.length; i++) {
        const asset = assetsToProcess[i];
        console.log(`Processing Asset ${i+1}/${assetsToProcess.length}: ${asset.name} (${asset.mimeType})`);
        
        let transcript = '';
        
        try {
            if (asset.mimeType === 'video/mp4') {
                const MP4_PATH = path.join(TEMP_DIR, `temp_${courseId}_${i}.mp4`);
                const MP3_PATH = path.join(TEMP_DIR, `temp_${courseId}_${i}.mp3`);
                
                await downloadFile(asset.url, MP4_PATH);
                await extractAudio(MP4_PATH, MP3_PATH);
                
                transcript = await transcribeAsset(MP3_PATH, 'audio/mp3', asset.name);
                
                if (fs.existsSync(MP4_PATH)) fs.unlinkSync(MP4_PATH);
                if (fs.existsSync(MP3_PATH)) fs.unlinkSync(MP3_PATH);
            } else if (asset.mimeType === 'application/pdf') {
                const PDF_PATH = path.join(TEMP_DIR, `temp_${courseId}_${i}.pdf`);
                
                await downloadFile(asset.url, PDF_PATH);
                transcript = await transcribeAsset(PDF_PATH, 'application/pdf', asset.name);
                
                if (fs.existsSync(PDF_PATH)) fs.unlinkSync(PDF_PATH);
            }

            // Save the raw text file as requested by user
            const TXT_PATH = path.join(TEMP_DIR, `transcript_${courseId}_${i}.txt`);
            fs.writeFileSync(TXT_PATH, transcript);
            
            combinedTranscripts += `\n\n--- MODULE: ${asset.name} ---\n${transcript}`;
            
        } catch (err) {
            console.error(`Error processing asset "${asset.name}":`, err.message);
        }
    }
    
    console.log(`Generating final Structured Learning Document from all transcripts...`);
    const finalResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
            { text: SUMMARY_PROMPT },
            { text: combinedTranscripts }
        ],
        config: { responseMimeType: "application/json" }
    });

    const aiData = JSON.parse(finalResponse.text);
    
    return {
        courseId: courseId,
        courseTitle: courseTitle,
        masterSummary: aiData.learning_document
    };
}

module.exports = {
    extractCourseContent
};
