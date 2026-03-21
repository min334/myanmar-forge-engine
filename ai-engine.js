import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getActiveModel(apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const baseUrl = "https://generativelanguage.googleapis.com";
    
    // ဒီနေရာမှာ v1 ကို ဖြုတ်ပြီး v1beta တစ်ခုတည်းပဲ ထားလိုက်ပါ
    // Request အရေအတွက် လျှော့ချဖို့အတွက်ပါ
    const versions = ["v1beta"]; 

    console.log("🔍 Scanning for available models in your API Key...");
    // ... ကျန်တဲ့ code တွေက အတူတူပါပဲ ...
    for (const ver of versions) {
        try {
            const response = await fetch(`${baseUrl}/${ver}/models?key=${apiKey}`);
            const data = await response.json();

            if (data.models) {
                // generateContent ရတဲ့ model ကို စစ်ထုတ်မယ်
                const target = data.models.find(m => 
                    m.supportedGenerationMethods.includes("generateContent") && 
                    (m.name.includes("flash") || m.name.includes("pro"))
                );

                if (target) {
                    console.log(`✅ Model Found in ${ver}: ${target.name}`);
                    return genAI.getGenerativeModel({ model: target.name.replace("models/", "") });
                }
            }
        } catch (e) {
            console.log(`⚠️ ${ver} check failed, trying next...`);
        }
    }
    throw new Error("No active generative models found in this API Key.");
}
