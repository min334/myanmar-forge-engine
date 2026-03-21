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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate a single HTML file with CSS and JS for: ${prompt}. Return ONLY the HTML code, no markdown, no explanations.` }] }]
        })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        let code = data.candidates[0].content.parts[0].text;
        return code.replace(/```html|```/g, "").trim();
    } else {
        throw new Error("AI response format error: " + JSON.stringify(data));
    }
}

async function forge() {
    console.log(`🚀 Forging started for: ${appIdea}`);
    try {
        const { data: user } = await octokit.users.getAuthenticated();
        const aiGeneratedCode = await getAICode(appIdea);

        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Update App: ${appIdea}`,
            content: Buffer.from(aiGeneratedCode).toString('base64'),
        });
        console.log("✅ Code sent to my-forged-app!");
    } catch (error) {
        console.error("❌ Forge Error:", error.message);
    }
}
forge();
