import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function autoFix() {
    try {
        const errorLog = fs.readFileSync('error.log', 'utf8');
        if (!errorLog) return;

        console.log("🔍 ခေါ်ယူရရှိနိုင်သော AI Model များကို စစ်ဆေးနေသည်...");
        
        // စမ်းသပ်မည့် Model List
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let model;
        let success = false;

        for (const modelName of modelsToTry) {
            try {
                console.log(`📡 Trying ${modelName}...`);
                model = genAI.getGenerativeModel({ model: modelName });
                
                const prompt = `Fix this Bubblewrap/Android error: ${errorLog}. 
                Provide the full corrected content for the necessary file (index.js or manifest.json). 
                Return ONLY raw code.`;

                const result = await model.generateContent(prompt);
                const fixedContent = result.response.text();

                if (fixedContent) {
                    if (fixedContent.includes('{')) {
                        fs.writeFileSync('twa-manifest.json', fixedContent);
                    } else {
                        fs.writeFileSync('index.js', fixedContent);
                    }
                    console.log(`✅ AI (${modelName}) မှ Error ကို ပြင်ဆင်ပေးလိုက်ပါပြီ။`);
                    success = true;
                    break; 
                }
            } catch (err) {
                console.log(`⚠️ ${modelName} မရသေးပါ၊ နောက်တစ်ခု ထပ်စမ်းပါမည်...`);
            }
        }

        if (!success) console.log("❌ မည်သည့် AI Model နှင့်မျှ ချိတ်ဆက်၍ မရပါ။ API Key ကို စစ်ဆေးပါ။");

    } catch (e) {
        console.log("🚨 Fatal Error: " + e.message);
    }
}
autoFix();
