import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function autoFix() {
    try {
        const errorLog = fs.readFileSync('error.log', 'utf8');
        if (!errorLog) return;

        console.log("🔍 Gemini 2.0 နှင့် အခြား Model များကို စမ်းသပ်နေသည်...");
        
        // Gemini 2.0 ကို ဦးစားပေး စမ်းသပ်ပါမည်
        const modelsToTry = [
            "gemini-2.0-flash-exp", 
            "gemini-1.5-flash", 
            "gemini-1.5-pro"
        ];
        
        let success = false;

        for (const modelName of modelsToTry) {
            try {
                console.log(`📡 Trying ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const prompt = `I am using Bubblewrap to build an APK and got this error: ${errorLog}.
                Please provide the content for a 'twa-manifest.json' file that fixes this.
                The JSON should include valid values for: packageId, host, name, launcherName, and startUrl.
                Return ONLY the raw JSON content.`;

                const result = await model.generateContent(prompt);
                const fixedContent = result.response.text().trim();

                // AI ပြန်ပေးတဲ့ content ထဲက JSON ကိုပဲ ဆွဲထုတ်ခြင်း
                const jsonMatch = fixedContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    fs.writeFileSync('twa-manifest.json', jsonMatch[0]);
                    console.log(`✅ AI (${modelName}) မှ twa-manifest.json ကို ဖန်တီးပေးလိုက်ပါပြီ။`);
                    success = true;
                    break; 
                }
            } catch (err) {
                console.log(`⚠️ ${modelName} အဆင်မပြေပါ။`);
            }
        }

        if (!success) console.log("❌ မည်သည့် Model နှင့်မျှ ချိတ်ဆက်၍မရပါ။ API Key ကို ပြန်စစ်ပေးပါ။");

    } catch (e) {
        console.log("🚨 Fatal Error: " + e.message);
    }
}
autoFix();
