import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });

async function getAICode(prompt) {
    // ဒီနေရာမှာ v1beta ကို v1 လို့ ပြောင်းထားပါတယ်
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate a single HTML file with CSS and JS for: ${prompt}. Return ONLY raw HTML code, no markdown.` }] }]
        })
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(`Gemini API Error: ${data.error.message}`);
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        let code = data.candidates[0].content.parts[0].text;
        return code.replace(/```html|```/g, "").trim();
    } else {
        throw new Error("Unexpected Response Format from Gemini");
    }
}

async function forge() {
    console.log(`🚀 Starting Forge for: ${appIdea}`);
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
        console.log("✅ SUCCESS! Code sent to my-forged-app repository.");
    } catch (error) {
        console.error("🚨 ENGINE ERROR:");
        console.error(error.message);
    }
}

forge();
