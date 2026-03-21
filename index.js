import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });
const genAI = new GoogleGenerativeAI(geminiKey);

async function forge() {
    try {
        console.log("🚀 Forge Engine: Using standard Gemini 1.5 Flash naming...");
        
        // နာမည်ကို models/ ထည့်ပြီး အပြည့်အစုံ ခေါ်ကြည့်ပါမယ်
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
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
        
        console.log("✅ SUCCESS! Your app is now ready in 'my-forged-app' repo.");
    } catch (e) {
        console.error("🚨 ENGINE ERROR:", e.message);
        // အကယ်၍ ထပ်ပြီး error တက်ခဲ့ရင် backup နာမည်နဲ့ စမ်းပါမယ်
        console.log("💡 Tip: Re-running in 1 minute might solve transient 429 errors.");
    }
}

forge();
