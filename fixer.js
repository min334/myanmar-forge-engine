import fs from 'fs';
// နာမည်ကို @google/generative-ai လို့ သေချာစစ်ပါ
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function autoFix() {
    try {
        const errorLog = fs.readFileSync('error.log', 'utf8');
        if (!errorLog) return;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`Fix this Bubblewrap error: ${errorLog}`);
        console.log("✅ AI suggested a fix.");
    } catch (e) { console.log("AI Error: " + e.message); }
}
autoFix();
