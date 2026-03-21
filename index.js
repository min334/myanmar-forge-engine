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
            contents: [{ parts: [{ text: `Generate a single HTML file for: ${prompt}. Use Tailwind CSS. Return ONLY raw HTML code without markdown code blocks.` }] }]
        })
    });
    const data = await response.json();
    let code = data.candidates[0].content.parts[0].text;
    return code.replace(/```html|```/g, "").trim();
}

async function forge() {
    try {
        const { data: user } = await octokit.users.getAuthenticated();
        const aiGeneratedCode = await getAICode(appIdea);

        // Repo အသစ်ထဲကို ဖိုင်သွားရေးခြင်း
        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Update App: ${appIdea}`,
            content: Buffer.from(aiGeneratedCode).toString('base64'),
        });
        console.log("✅ Code sent successfully!");
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}
forge();
