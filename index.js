import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });
const genAI = new GoogleGenerativeAI(geminiKey);

async function scanAllModels() {
    console.log("📂 Scanning for ALL Flash and Preview models...");
    
    // ခင်ဗျား စမ်းချင်တဲ့ Preview Model နာမည်တွေ အကုန်ဒီထဲမှာပါပါတယ်
    const modelsToScan = [
        "gemini-2.0-flash-exp",        // Gemini 2.0 Flash (Preview)
        "gemini-1.5-flash-latest",     // 1.5 Flash (Latest)
        "gemini-1.5-flash-8b-exp-0827",// Flash 8B (Preview)
        "gemini-1.5-flash-002",        // 1.5 Flash (New Stable)
        "gemini-1.5-pro-latest",       // 1.5 Pro (Latest)
        "gemini-pro"                   // Pro (Standard)
    ];
    
    let activeModel = null;
    let activeModelName = "";

    for (const m of modelsToScan) {
        try {
            console.log(`🔍 Testing: ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            
            // Model တကယ် အသက်ဝင်လား သိရအောင် response တောင်းကြည့်မယ်
            const result = await model.generateContent("ping");
            await result.response;
            
            console.log(`✅ FOUND ACTIVE MODEL: ${m}`);
            activeModel = model;
            activeModelName = m;
            break; // တစ်ခု အောင်မြင်တာနဲ့ ရပ်မယ်
        } catch (err) {
            console.log(`❌ ${m} is not available: ${err.message}`);
            // Error တက်လည်း နောက် model တစ်ခုကို ဆက်စစ်မယ်
        }
    }

    if (!activeModel) {
        throw new Error("No active Gemini models found. Please check your API Key and regional availability.");
    }
    return { model: activeModel, name: activeModelName };
}

async function forge() {
    console.log(`🚀 Starting Smart Forge for: ${appIdea}`);
    try {
        const { data: user } = await octokit.users.getAuthenticated();
        
        // ၁။ အလုပ်လုပ်တဲ့ model ကို အရင်ရှာမယ်
        const { model: activeModel, name: modelName } = await scanAllModels();
        
        // ၂။ အဲဒီ model နဲ့ App Code ကို ရေးခိုင်းမယ်
        console.log(`🤖 AI (${modelName}) is writing your app code...`);
        const fullPrompt = `Generate a single HTML file with CSS and JS for: ${appIdea}. Return ONLY raw HTML code, no markdown blocks.`;
        const result = await activeModel.generateContent(fullPrompt);
        const response = await result.response;
        let code = response.text().replace(/```html|```/g, "").trim();

        // ၃။ ရလာတဲ့ code ကို Repo ဆီ ပို့မယ်
        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'my-forged-app', 
            path: 'index.html',
            message: `Engine Build via ${modelName}: ${appIdea}`,
            content: Buffer.from(code).toString('base64'),
        });
        
        console.log(`🎉 SUCCESS! App created using ${modelName}. Check 'my-forged-app' repo.`);
    } catch (error) {
        console.error("🚨 ENGINE ERROR REPORT:");
        console.error(error.message);
    }
}

forge();
