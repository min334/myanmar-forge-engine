import fs from 'fs';
import { getActiveModel } from "./ai-engine.js";

// AI ကို Control App လုပ်ခိုင်းဖို့ Idea ပေးထားတာပါ
const appIdea = "A professional mobile controller app with dark theme, for triggering GitHub Actions. It has inputs for GitHub Token, App Idea, and a Start Forge button.";
const geminiKey = process.env.GEMINI_API_KEY;

async function forge() {
    try {
        console.log("🚀 Forging the Master Controller App...");
        const model = await getActiveModel(geminiKey);
        
        // AI ဆီကနေ Controller App ရဲ့ HTML ကို တောင်းမယ်
        const prompt = `Create a professional single-file HTML for a Mobile Controller. 
        Theme: Dark Navy and Crimson.
        Inputs: GitHub Token (password type), App Idea (textarea).
        Logic: On button click, fetch POST to 'https://api.github.com/repos/min334/myanmar-forge-engine/dispatches' using the token.
        Return ONLY raw HTML.`;

        const result = await model.generateContent(prompt);
        let code = result.response.text().replace(/```html|```/g, "").trim();

        fs.writeFileSync('index.html', code);
        console.log("✅ Control App UI generated successfully!");
    } catch (e) {
        console.error("🚨 Forge Error:", e.message);
        process.exit(1);
    }
}
forge();
