import fs from 'fs';

// ခင်ဗျားပေးထားတဲ့ အားကိုးရတဲ့ Function
export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing in Secrets!");
    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResponse = await fetch(listUrl);
        const listData = await listResponse.json();
        if (!listResponse.ok) throw new Error(listData.error?.message || "Failed to fetch model list");

        const availableModels = listData.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name);

        for (const modelPath of availableModels) {
            try {
                const testUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
                const testRes = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                });

                if (testRes.ok) {
                    return {
                        generateContent: async (prompt) => {
                            const res = await fetch(testUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                            });
                            const data = await res.json();
                            // ဒီနေရာမှာ candidates ရှိမရှိ သေချာစစ်ပါမယ် (Error ကာကွယ်ရန်)
                            if (!data.candidates || data.candidates.length === 0) {
                                throw new Error("AI returned no candidates. Prompt might be blocked.");
                            }
                            return { response: { text: () => data.candidates[0].content.parts[0].text } };
                        }
                    };
                }
            } catch (err) { continue; }
        }
    } catch (e) { console.error("🚨 Discovery Error:", e.message); }
    throw new Error("Could not find any active model.");
}

// ပင်မ အလုပ်လုပ်မည့်အပိုင်း
async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const idea = process.env.APP_IDEA || "A simple app";

    try {
        console.log("🤖 Initializing AI Forge...");
        const model = await getActiveModel(apiKey);
        
        const prompt = `Create a professional single-file HTML5 mobile app for: ${idea}. Use CSS for styling and Vanilla JS for logic. Include Myanmar language if needed. Return ONLY the HTML code starting with <!DOCTYPE html>. No markdown backticks.`;
        
        const result = await model.generateContent(prompt);
        let code = result.response.text().trim();

        // Markdown block (```html) တွေပါလာရင် ဖယ်ထုတ်မယ်
        code = code.replace(/```html/gi, "").replace(/```/g, "").trim();

        if (!fs.existsSync('www')) fs.mkdirSync('www');
        fs.writeFileSync('www/index.html', code);
        
        console.log("✅ New App successfully forged in 'www/index.html'!");
    } catch (error) {
        console.error("🚨 Forge Failed:", error.message);
        process.exit(1);
    }
}

run();
