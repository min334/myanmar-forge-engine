import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });

// API Version ကို v1beta လို့ အတိအကျ သတ်မှတ်ခြင်း
const genAI = new GoogleGenerativeAI(geminiKey);

async function forge() {
    try {
        console.log("🚀 Forge Engine: Targetting Gemini 1.5 Flash (v1beta)...");
        
        // v1beta version ကို သုံးပြီး model ခေါ်ယူခြင်း
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            apiVersion: "v1beta" 
        });
        
        const prompt = `Generate a single HTML file with CSS and JS for: ${appIdea}. Return ONLY the raw code.`;
        
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
        
        console.log("✅ SUCCESS! Check your 'my-forged-app' repository now.");
    } catch (e) {
        console.error("🚨 ENGINE ERROR:", e.message);
        console.log("💡 Suggestion: If 404 persists, we will switch to v1 names.");
    }
}

forge();
