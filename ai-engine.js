import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getActiveModel(apiKey) {
    // API Key ရှိမရှိ အရင်စစ်မယ်
    if (!apiKey) throw new Error("API Key is missing in Secrets!");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
        console.log("🚀 Forge Engine: Connecting to Gemini 1.5 Flash directly...");
        // Scan ဖတ်မနေတော့ဘဲ တိုက်ရိုက် Model ကို ခေါ်လိုက်ပါမယ်
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        return model;
    } catch (e) {
        console.error("🚨 Connection Error:", e.message);
        throw new Error("Could not initialize Gemini model.");
    }
}
