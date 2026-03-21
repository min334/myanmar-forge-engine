import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const geminiKey = process.env.GEMINI_API_KEY;

// အောက်က စာကြောင်းလေး အသစ်ထည့်ပါ
console.log("Checking Gemini Key:", geminiKey ? "Found (Length: " + geminiKey.length + ")" : "NOT FOUND! Check your GitHub Secrets.");

const octokit = new Octokit({ auth: githubToken });

async function getAICode(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate a single HTML file with CSS and JS for: ${prompt}. Return ONLY raw HTML code, no markdown code blocks.` }] }]
        })
    });

    const data = await response.json();

    // Error ရှာဖွေရေးအပိုင်း (ဒီနေရာက အရေးကြီးပါတယ်)
    if (data.error) {
        console.error("❌ Gemini API Error Details:");
        console.error(`Status: ${data.error.status}`);
        console.error(`Message: ${data.error.message}`);
        throw new Error(`Gemini API failed: ${data.error.message}`);
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        let code = data.candidates[0].content.parts[0].text;
        return code.replace(/```html|```/g, "").trim();
    } else {
        console.log("Full AI Response:", JSON.stringify(data, null, 2));
        throw new Error("Unexpected Response Format from Gemini");
    }
}

async function forge() {
    console.log(`🚀 Starting Diagnostic Forge for: ${appIdea}`);
    try {
        const { data: user } = await octokit.users.getAuthenticated();
        const aiGeneratedCode = await getAICode(appIdea);

        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Diagnostic Build: ${appIdea}`,
            content: Buffer.from(aiGeneratedCode).toString('base64'),
        });
        console.log("✅ Success! Code sent to my-forged-app.");
    } catch (error) {
        console.error("🚨 ENGINE ERROR REPORT:");
        console.error(error.message);
    }
}
forge();
