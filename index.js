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
            contents: [{ parts: [{ text: `Write only the HTML code (including Tailwind CSS and JavaScript logic) for a professional mobile-friendly app: ${prompt}. Do not include markdown formatting or explanations. Focus on Myanmar gold units.` }] }]
        })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.replace(/```html|```/g, "").trim();
}

async function forge() {
    console.log(`🤖 AI is forging for new repo: ${appIdea}`);
    try {
        const { data: user } = await octokit.users.getAuthenticated();
        const aiGeneratedCode = await getAICode(appIdea);

        // အရေးကြီးဆုံးအချက် - Repo နာမည်ကို 'my-forged-app' (သို့) သင်ဆောက်ထားတဲ့ Repo နာမည် ပြောင်းပေးပါ
        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Auto Forged: ${appIdea}`,
            content: Buffer.from(aiGeneratedCode).toString('base64'),
        });

        console.log("✅ Code sent to your product repository!");
    } catch (error) {
        console.error("❌ Forge Error:", error.message);
    }
}

forge();
