import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });
const genAI = new GoogleGenerativeAI(geminiKey);

async function listAndFindModel() {
    console.log("📂 Fetching available Gemini models...");
    
    try {
        // API ဆီကနေ ရနိုင်တဲ့ model စာရင်းကို တောင်းဆိုခြင်း
        // မှတ်ချက် - SDK version အလိုက် listModels() သို့မဟုတ် အလားတူ function သုံးရပါမယ်
        // လက်ရှိတွင် common models ကို diagnostic အနေနဲ့ အရင်စစ်ဆေးပါမယ်
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
        
        let selectedModel = null;

        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent("ping"); // Model အလုပ်လုပ်လား စမ်းသပ်ခြင်း
                console.log(`✅ Model Found and Active: ${m}`);
                selectedModel = model;
                break; // အလုပ်လုပ်တဲ့ တစ်ခုတွေ့တာနဲ့ ရပ်မယ်
            } catch (err) {
                console.log(`❌ Model ${m} is not available.`);
            }
        }

        if (!selectedModel) throw new Error("No active models found.");
        return selectedModel;

    } catch (error) {
        throw new Error("Failed to list or connect to models: " + error.message);
    }
}

async function forge() {
    console.log(`🚀 Smart Diagnostic Forge: ${appIdea}`);
    try {
        const { data: user } = await octokit.users.getAuthenticated();
        
        // Model စာရင်းထဲမှ အလုပ်လုပ်မည့်ကောင်ကို ရွေးချယ်ခြင်း
        const activeModel = await listAndFindModel();
        
        console.log("🎨 Generating Application Code...");
        const fullPrompt = `Generate a single HTML file with CSS and JS for: ${appIdea}. Return ONLY raw HTML.`;
        
        const result = await activeModel.generateContent(fullPrompt);
        const response = await result.response;
        let code = response.text().replace(/```html|```/g, "").trim();

        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Build with Auto-selected Model: ${appIdea}`,
            content: Buffer.from(code).toString('base64'),
        });
        
        console.log("🎉 SUCCESS! Your app code has been forged and sent to 'my-forged-app'.");
    } catch (error) {
        console.error("🚨 DIAGNOSTIC ERROR:");
        console.error(error.message);
    }
}

forge();
