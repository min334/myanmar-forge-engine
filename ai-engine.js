import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getActiveModel(apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // v1 နဲ့ v1beta နှစ်ခုလုံးကို endpoint အနေနဲ့ စမ်းစစ်ဖို့ logic
    const baseUrl = "https://generativelanguage.googleapis.com";
    const versions = ["v1beta", "v1"];

    console.log("🔍 Scanning for available models in your API Key...");

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
