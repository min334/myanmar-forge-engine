import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });
const genAI = new GoogleGenerativeAI(geminiKey);

// Quota error တက်ရင် ခဏစောင့်ပြီး ပြန်ကြိုးစားပေးမယ့် function
async function generateWithWait(model, prompt) {
    let attempts = 0;
    while (attempts < 2) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            if (error.message.includes("429") && attempts === 0) {
                console.log("⚠️ Rate limit hit. Waiting 10 seconds before final retry...");
                await new Promise(r => setTimeout(r, 10000)); // ၁၀ စက္ကန့် စောင့်မယ်
                attempts++;
                continue;
            }
            throw error;
        }
    }
}

async function forge() {
    try {
        console.log("🚀 Forge Engine: Using gemini-1.5-flash for stability...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Generate a single HTML file for: ${appIdea}. Return ONLY the raw code.`;
        const codeText = await generateWithWait(model, prompt);
        const cleanCode = codeText.replace(/```html|```/g, "").trim();

        const { data: user } = await octokit.users.getAuthenticated();
        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Stable Build: ${appIdea}`,
            content: Buffer.from(cleanCode).toString('base64'),
        });
        console.log("✅ SUCCESS! Your app is forged.");
    } catch (e) {
        console.error("🚨 FINAL ERROR:", e.message);
    }
}
forge();
