import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function autoFix() {
    try {
        const errorLog = fs.readFileSync('error.log', 'utf8');
        if (!errorLog) return;

        console.log("🛠️ AI စက်ပြင်ဆရာ စစ်ဆေးနေပါပြီ...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Error building APK: ${errorLog}. Fix the manifest.json or index.js. 
        Note: If icon download failed, remove the icon from manifest or use a valid placeholder. 
        Return ONLY the corrected code for the file.`;

        const result = await model.generateContent(prompt);
        const fixedCode = result.response.text();
        
        if (fixedCode.includes('import fs')) {
            fs.writeFileSync('index.js', fixedCode);
        } else if (fixedCode.includes('{')) {
            fs.writeFileSync('manifest.json', fixedCode);
        }
    } catch (e) {
        console.log("Fixer error: " + e.message);
    }
}
autoFix();
