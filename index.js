import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });
const genAI = new GoogleGenerativeAI(geminiKey);

async function getWorkingModel() {
    console.log("🔍 Fetching active models for your API Key...");
    
    try {
        // သုံးလို့ရတဲ့ model စာရင်းကို API ကနေ တိုက်ရိုက်တောင်းတာဖြစ်ပါတယ်
        // မှတ်ချက် - v1beta endpoint ကို သုံးမှ listModels က ပိုအဆင်ပြေတတ်ပါတယ်
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(`API Error: ${data.error.message}`);
        }

        // အလုပ်လုပ်နိုင်တဲ့ model တွေကို စစ်ထုတ်ခြင်း
        const availableModels = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace("models/", ""));

        console.log("📋 Available Models:", availableModels.join(", "));

        // Flash preview သို့မဟုတ် flash model တွေကို ဦးစားပေးရွေးပါမယ်
        const priorityModel = availableModels.find(m => m.includes("2.0-flash") || m.includes("1.5-flash")) || availableModels[0];

        if (!priorityModel) throw new Error("No generative models found for this key.");

        console.log(`🎯 Auto-selected Model: ${priorityModel}`);
        return genAI.getGenerativeModel({ model: priorityModel });
        
    } catch (err) {
        console.error("❌ Failed to list models, falling back to basic check...");
        // list ထုတ်လို့မရရင် manual စစ်တဲ့စနစ်ကို သုံးမယ်
        return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
}

async function forge() {
    console.log(`🚀 Smart Engine Build Started for: ${appIdea}`);
    try {
        const { data: user } = await octokit.users.getAuthenticated();
        
        // အလုပ်လုပ်တဲ့ model ကို အလိုအလျောက် ရွေးခိုင်းခြင်း
        const model = await getWorkingModel();
        
        console.log("🤖 Generating code with selected model...");
        const result = await model.generateContent(`Generate a single HTML file with CSS and JS for: ${appIdea}. Return ONLY raw HTML code.`);
        const response = await result.response;
        let code = response.text().replace(/```html|```/g, "").trim();

        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Engine Build: ${appIdea}`,
            content: Buffer.from(code).toString('base64'),
        });
        
        console.log("✅ SUCCESS! Check your 'my-forged-app' repository.");
    } catch (error) {
        console.error("🚨 ENGINE ERROR:", error.message);
    }
}

forge();
