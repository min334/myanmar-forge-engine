import fs from 'fs';

/**
 * ကိုမင်းသစ္စာအောင် ပေးထားသော Smart Model Discovery Logic
 */
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

        for (const modelPath of availableModels) {
            try {
                const testUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
                const testRes = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                });

                if (testRes.ok) {
                    console.log(`✅ Ready: ${modelPath}`);
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

/**
 * Capacitor Configuration များကို ပြင်ဆင်ပေးမည့် Logic
 */
async function runFixer() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return;

        console.log("🤖 AI Fixer is running for Capacitor...");

        // Capacitor အတွက် လိုအပ်သော folder နှင့် file များ ရှိမရှိ စစ်ဆေးခြင်း
        if (!fs.existsSync('./www')) {
            fs.mkdirSync('./www', { recursive: true });
            fs.writeFileSync('./www/index.html', '<html><body>Forge Engine Ready</body></html>');
            console.log("✅ Created missing 'www' directory and index.html");
        }

        // အကယ်၍ capacitor.config.json မရှိလျှင် အသစ်ဆောက်ပေးခြင်း
        if (!fs.existsSync('./capacitor.config.json')) {
            const config = {
                appId: 'com.minthitsar.goldcalc',
                appName: 'Myanmar Forge',
                webDir: 'www',
                bundledWebRuntime: false
            };
            fs.writeFileSync('./capacitor.config.json', JSON.stringify(config, null, 2));
            console.log("✅ Created capacitor.config.json");
        }

    } catch (err) {
        console.log("🚨 Fixer Execution Failed: " + err.message);
    }
}

runFixer();
