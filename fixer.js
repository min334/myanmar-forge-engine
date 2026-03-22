import fs from 'fs';

// ခင်ဗျားပေးထားတဲ့ Smart Scanner Logic
export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing in Secrets!");
    console.log("🔍 Scanning for available generative models...");

    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResponse = await fetch(listUrl);
        const listData = await listResponse.json();

        if (!listResponse.ok) throw new Error(listData.error?.message || "Failed to fetch model list");

        const availableModels = listData.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name);

        console.log(`📋 Found ${availableModels.length} potential models.`);

        for (const modelPath of availableModels) {
            try {
                console.log(`🧪 Testing: ${modelPath}...`);
                const testUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
                
                const testRes = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                });

                if (testRes.ok) {
                    console.log(`✅ Success! Ready: ${modelPath}`);
                    return {
                        generateContent: async (prompt) => {
                            const res = await fetch(testUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                            });
                            const data = await res.json();
                            return { response: { text: () => data.candidates[0].content.parts[0].text } };
                        }
                    };
                }
            } catch (err) { continue; }
        }
    } catch (e) { console.error("🚨 Discovery Error:", e.message); }
    throw new Error("No active model found.");
}

// AI Fixer ကို စတင်အသုံးပြုခြင်း
async function startFix() {
    try {
        const errorLog = fs.readFileSync('error.log', 'utf8');
        if (!errorLog) return;

        const apiKey = process.env.GEMINI_API_KEY;
        const model = await getActiveModel(apiKey); // Smart Scan လုပ်မည်

        const prompt = `Fix this Bubblewrap error: ${errorLog}. Return ONLY corrected twa-manifest.json content.`;
        const result = await model.generateContent(prompt);
        const fixedContent = result.response.text();

        // JSON ကို သေချာထုတ်ယူပြီး သိမ်းခြင်း
        const jsonMatch = fixedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            fs.writeFileSync('twa-manifest.json', jsonMatch[0]);
            console.log("🛠️ AI has repaired the manifest file.");
        }
    } catch (err) {
        console.log("❌ Fixer failed: " + err.message);
    }
}

startFix();
