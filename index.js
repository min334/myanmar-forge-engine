import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });
const genAI = new GoogleGenerativeAI(geminiKey);

async function getAICode(prompt) {
    // ခင်ဗျားသုံးချင်တဲ့ Model နှစ်ခုကို စာရင်းသွင်းထားပါတယ်
    const flashModels = ["gemini-2.0-flash", "gemini-1.5-flash"];
    
    for (const modelName of flashModels) {
        try {
            console.log(`🤖 Attempting to use: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const fullPrompt = `Generate a single HTML file with CSS and JS for: ${prompt}. Return ONLY raw HTML code.`;
            
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            let text = response.text();
            
            console.log(`✅ Success with ${modelName}!`);
            return text.replace(/```html|```/g, "").trim();
        } catch (e) {
            console.log(`⚠️ ${modelName} failed or quota full. Trying next...`);
            // 429 Error ဖြစ်ဖြစ် တခြား Error ဖြစ်ဖြစ် နောက် model တစ်ခုကို ဆက်စမ်းမယ်
            continue;
        }
    }
    throw new Error("❌ Both Gemini 2.0 and 1.5 Flash models are currently unavailable.");
}

async function forge() {
    console.log(`🚀 Dual-Forge Engine Started: ${appIdea}`);
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
        console.log("🎉 MISSION ACCOMPLISHED! Your app is ready in 'my-forged-app'.");
    } catch (error) {
        console.error("🚨 ENGINE FATAL ERROR:", error.message);
    }
}

forge();
