import fs from 'fs';
import { getActiveModel } from "./ai-engine.js";

const appIdea = process.argv[2] || "Myanmar Gold Calculator App";
const geminiKey = process.env.GEMINI_API_KEY;

async function forge() {
    try {
        console.log("🚀 Starting Myanmar Forge Engine (Dynamic Mode)...");
        
        // အလုပ်လုပ်တဲ့ Model ကို အလိုအလျောက် ရှာမယ်
        const model = await getActiveModel(geminiKey);
        
        console.log("🤖 AI is now generating the app code...");
        
        const prompt = `Create a professional single-file HTML app for: ${appIdea}. Return ONLY raw HTML code without markdown.`;
        const result = await model.generateContent(prompt);
        let code = result.response.text().replace(/```html|```/g, "").trim();

        fs.writeFileSync('index.html', code);
        console.log("📦 index.html has been successfully generated!");

    } catch (e) {
        console.error("🚨 Critical Failure:", e.message);
        // Build မပျက်သွားအောင် အရေးပေါ် ဖိုင်တစ်ခု ဖန်တီးပေးထားမယ်
        fs.writeFileSync('index.html', `<html><body><h1>Build Failed</h1><p>${e.message}</p></body></html>`);
        process.exit(1); 
    }
}

forge();
