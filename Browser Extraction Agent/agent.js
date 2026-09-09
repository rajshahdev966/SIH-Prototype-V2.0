require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

// Set FFmpeg path (Keep this configured for your Windows machine)
ffmpeg.setFfmpegPath('C:\\Users\\Raj Shah\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffmpeg.exe');
const { GoogleGenAI } = require('@google/genai');

// ==========================================
// ⚙️ AGENT CONFIGURATION & CUSTOMIZATION
// ==========================================

// Parse Course ID from command line arguments
const COURSE_ID = process.argv[2]; 
if (!COURSE_ID) {
    console.error('\n❌ Error: Please provide a Course ID!');
    console.error('👉 Usage: node agent.js <course_id>');
    console.error('👉 Example: node agent.js do_1143052789530787841562\n');
    process.exit(1);
}

const TEMP_DIR = path.join(__dirname, 'temp_files');
const RESULTS_DIR = path.join(__dirname, `course_results_${COURSE_ID}`);

// The Prompt instructions for the AI Agent
const AGENT_PROMPT = `You are an expert instructional designer and teacher. Listen to the provided lecture audio. 
Generate a comprehensive and highly detailed "Structured Learning Document" that summarizes the core concepts, definitions, and key takeaways from the audio in Markdown format. 
This summary must be extremely detailed as it will be used later as the sole knowledge base for generating rigorous assessments.

Return your entire response as a single valid JSON object following this exact schema, without any markdown formatting blocks like \`\`\`json around it.
{
  "learning_document": "Markdown string containing the comprehensive summary, key concepts, definitions, and any important lists or frameworks discussed."
}`;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Ensure directories exist
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR);

// ==========================================
// 🛠️ PIPELINE FUNCTIONS
// ==========================================

// Fetch Hierarchy & Extract MP4s
async function getCourseVideos(courseId) {
    const url = `https://portal.igotkarmayogi.gov.in/api/course/v1/hierarchy/${courseId}?hierarchyType=detail`;
    console.log(`\n🔍 Fetching course hierarchy for ${courseId}...`);
    try {
        const response = await axios.get(url);
        const videos = [];

        function traverse(node) {
            if (node.mimeType === 'video/mp4' && node.artifactUrl) {
                videos.push({ name: node.name, url: node.artifactUrl });
            }
            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(traverse);
            }
        }
        traverse(response.data.result.content);
        return videos;
    } catch (e) {
        throw new Error(`Failed to fetch course: ${e.message}. Are you sure the Course ID is correct?`);
    }
}

// Download Video
async function downloadVideo(url, outputPath) {
    console.log('   📥 Downloading MP4 from iGOT...');
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    const response = await axios({ method: 'GET', url: url, responseType: 'stream' });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Extract Audio
async function extractAudio(inputPath, outputPath) {
    console.log('   🎵 Extracting Audio (MP3) using FFmpeg...');
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath).toFormat('mp3').on('end', resolve).on('error', reject).save(outputPath);
    });
}

// Wait for Gemini File Processing
async function waitForProcessing(fileName) {
    console.log(`   ⏳ Waiting for Gemini to process the audio (${fileName})...`);
    let fileInfo = await ai.files.get({ name: fileName });
    while (fileInfo.state === 'PROCESSING') {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        fileInfo = await ai.files.get({ name: fileName });
    }
    if (fileInfo.state === 'FAILED') throw new Error('File processing failed in Gemini.');
    console.log('   ✅ File is ready for AI inference.');
}

// ==========================================
// 🚀 MAIN EXECUTION LOOP
// ==========================================
(async () => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
            throw new Error('Please add your GEMINI_API_KEY to the .env file!');
        }

        const videos = await getCourseVideos(COURSE_ID);
        console.log(`📊 Found ${videos.length} videos in the course! Results will be saved to /course_results_${COURSE_ID}`);
        
        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            console.log(`\n--- Processing Video ${i + 1}/${videos.length}: "${video.name}" ---`);
            
            const safeName = video.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const outputJsonPath = path.join(RESULTS_DIR, `${safeName}_output.json`);
            
            if (fs.existsSync(outputJsonPath)) {
                console.log(`   ⏭️ Output already exists for this video. Skipping.`);
                continue;
            }

            const MP4_PATH = path.join(TEMP_DIR, `temp_${i}.mp4`);
            const MP3_PATH = path.join(TEMP_DIR, `temp_${i}.mp3`);

            try {
                await downloadVideo(video.url, MP4_PATH);
                await extractAudio(MP4_PATH, MP3_PATH);

                console.log('   ☁️ Uploading Audio to Gemini...');
                const uploadResult = await ai.files.upload({ file: MP3_PATH, mimeType: 'audio/mp3' });
                await waitForProcessing(uploadResult.name);

                console.log('   🧠 Analyzing Audio & Generating Output...');
                const response = await ai.models.generateContent({
                    model: 'gemini-3.6-flash',
                    contents: [
                        { fileData: { mimeType: uploadResult.mimeType, fileUri: uploadResult.uri } },
                        { text: AGENT_PROMPT }
                    ],
                    config: { responseMimeType: "application/json" }
                });

                fs.writeFileSync(outputJsonPath, response.text);
                console.log(`   🎉 Success! Saved to: course_results_${COURSE_ID}/${safeName}_output.json`);

                if (fs.existsSync(MP4_PATH)) fs.unlinkSync(MP4_PATH);
                if (fs.existsSync(MP3_PATH)) fs.unlinkSync(MP3_PATH);

            } catch (err) {
                console.error(`   ❌ Error processing video "${video.name}":`, err.message);
            }
        }
        console.log('\n✅ All Course videos processed successfully!');
    } catch (error) {
        console.error('Error during execution:', error.message);
    }
})();
