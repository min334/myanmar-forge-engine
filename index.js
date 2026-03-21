import { Octokit } from "@octokit/rest";
import { getActiveModel } from "./ai-engine.js";
import fs from 'fs';

// Argument ကနေ App Idea ကို ယူမယ်၊ မပါရင် Default တစ်ခု ပေးထားမယ်
const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });

async function forge() {
    try {
        console.log("🚀 Starting Myanmar Forge Engine...");
        console.log(`💡 Building Idea: ${appIdea}`);

        // AI Engine ဆီကနေ အလုပ်လုပ်မယ့် Model Strategy တစ်ခု တောင်းမယ်
        const model = await getActiveModel(geminiKey);
        
        console.log("🤖 AI is generating your App Code, please wait...");
        
        const prompt = `Create a single file HTML app for: ${appIdea}. 
        Requirements:
        1. Modern UI with CSS.
        2. Functional logic with JavaScript.
        3. Entire app in one single HTML file.
        Return ONLY the raw HTML code, no markdown backticks.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let code = response.text();

        // Markdown ```html စာသားတွေ ပါလာရင် ဖယ်ထုတ်မယ်
        code = code.replace(/```html|```/g, "").trim();

        // ၁။ Local မှာ index.html အရင် သိမ်းမယ် (Build Step အတွက်)
        fs.writeFileSync('index.html', code);

        if (fs.existsSync('index.html')) {
            console.log("✅ Local index.html created successfully.");
        }

        // ၂။ GitHub Repo ထဲကိုလည်း Update လုပ်ပေးမယ် (Backup အနေနဲ့)
        try {
            const { data: user } = await octokit.users.getAuthenticated();
            await octokit.repos.createOrUpdateFileContents({
                owner: user.login,
                repo: 'my-forged-app', 
                path: 'index.html',
                message: `Forge Build: ${appIdea}`,
                content: Buffer.from(code).toString('base64'),
            });
            console.log("✅ GitHub Repository updated.");
        } catch (githubErr) {
            console.log("⚠️ GitHub Upload skipped or failed, but Local Build will continue.");
        }

        console.log("🚀 ALL DONE! Proceeding to Android Build phase...");
        
    } catch (e) {
        console.error("🚨 FORGE CRITICAL ERROR:", e.message);
        // Error ဖြစ်ရင် Workflow ကို ရပ်ပစ်ဖို့ exit code 1 ပေးမယ်
        process.exit(1);
    }
}

forge();
