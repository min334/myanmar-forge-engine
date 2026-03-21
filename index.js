import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });
const genAI = new GoogleGenerativeAI(geminiKey);

async function getAICode(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `Generate a single HTML file with Tailwind CSS and JS for: ${prompt}. Return ONLY raw HTML, no markdown code blocks.`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let code = response.text();
    return code.replace(/```html|```/g, "").trim();
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
            message: `Engine Build: ${appIdea}`,
            content: Buffer.from(aiGeneratedCode).toString('base64'),
        });
        console.log("✅ SUCCESS! Your app is ready in 'my-forged-app'.");
    } catch (error) {
        console.error("🚨 ENGINE ERROR:", error.message);
    }
}

forge();
