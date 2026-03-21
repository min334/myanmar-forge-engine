import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });

async function getAICode(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            contents: [{ parts: [{ text: `Write only the HTML code (including Tailwind CSS) for this app idea: ${prompt}. Do not include markdown formatting or explanations.` }] }]
        })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.replace(/```html|```/g, "").trim();
}

async function forge() {
    console.log(`🤖 AI is thinking about: ${appIdea}`);
    try {
        const { data: user } = await octokit.users.getAuthenticated();
        
        // AI ဆီကနေ Code တောင်းခြင်း
        const aiGeneratedCode = await getAICode(appIdea);

        // ရလာတဲ့ Code ကို 'forged-app.html' အဖြစ် သိမ်းခြင်း
        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'myanmar-forge-engine',
            path: 'forged-app.html',
            message: `AI Forged: ${appIdea}`,
            content: Buffer.from(aiGeneratedCode).toString('base64'),
        });

        console.log("✅ AI has successfully forged your app into 'forged-app.html'!");
    } catch (error) {
        console.error("❌ Forge Error:", error.message);
    }
}

forge();
