import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });
const genAI = new GoogleGenerativeAI(geminiKey);

async function findWorkingModel() {
    console.log("🔍 Searching for an active Gemini model...");
    // လက်ရှိရနိုင်တဲ့ model တွေကို စစ်ဆေးဖို့ ကြိုးစားကြည့်မယ်
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    
    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // model အလုပ်လုပ်လား သိရအောင် စာသားတိုလေး တစ်ခု အရင်မေးကြည့်မယ်
            await model.generateContent("Hi");
            console.log(`✅ Success! Using model: ${modelName}`);
            return model;
        } catch (e) {
            console.log(`⚠️ ${modelName} is not available, trying next...`);
        }
    }
    throw new Error("❌ No working Gemini models found. Please check your API Key permissions.");
}

async function forge() {
    console.log(`🚀 Smart Forge Process Started for: ${appIdea}`);
    try {
        const { data: user } = await octokit.users.getAuthenticated();
        
        // ၁။ အလုပ်လုပ်တဲ့ model ကို အရင်ရှာမယ်
        const activeModel = await findWorkingModel();
        
        // ၂။ အဲဒီ model နဲ့ App Code ကို ရေးခိုင်းမယ်
        console.log("🤖 AI is writing your app code...");
        const fullPrompt = `Generate a single HTML file with CSS (Tailwind) and JS for: ${appIdea}. Return ONLY raw HTML code, NO markdown blocks.`;
        const result = await activeModel.generateContent(fullPrompt);
        const response = await result.response;
        let code = response.text().replace(/```html|```/g, "").trim();

        // ၃။ ရလာတဲ့ code ကို Repo အသစ်ဆီ ပို့မယ်
        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Smart Build: ${appIdea}`,
            content: Buffer.from(code).toString('base64'),
        });
        
        console.log("🎉 CONGRATULATIONS! Your app code is now in 'my-forged-app'.");
    } catch (error) {
        console.error("🚨 SMART FORGE ERROR:", error.message);
    }
}

forge();
