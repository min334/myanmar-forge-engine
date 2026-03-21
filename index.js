import { Octokit } from "@octokit/rest";
import { getActiveModel } from "./ai-engine.js";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });

async function forge() {
    try {
        console.log("🚀 Starting Myanmar Forge Engine...");
        
        // AI Engine ဆီကနေ အလုပ်လုပ်တဲ့ model ကို အရင်တောင်းမယ်
        const model = await getActiveModel(geminiKey);
        
        console.log("🤖 Generating App Code...");
        const prompt = `Create a single file HTML app for: ${appIdea}. Include CSS and JS. return ONLY the code.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let code = response.text().replace(/```html|```/g, "").trim();

        const { data: user } = await octokit.users.getAuthenticated();
        
        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Engine Build: ${appIdea}`,
            content: Buffer.from(code).toString('base64'),
        });
        
        console.log("🎉 SUCCESS! Check your 'my-forged-app' repo.");
    } catch (e) {
        console.error("🚨 CRITICAL ERROR:", e.message);
    }
}

forge();
