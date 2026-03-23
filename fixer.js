import fs from 'fs';
import path from 'path';

/**
 * ၁။ Android Project ထဲက Icon နဲ့ Splash ကို HD PNG နဲ့ အတင်းလိုက်ပြင်မယ့် Logic
 */
function patchAndroidProject() {
    console.log("🛠️ AI Patcher is executing HD Icon & Splash Fix...");
    
    const possiblePaths = ['./', './assets/', './assets/assets/'];
    const foundFiles = {};
    
    ['icon-only.png', 'splash.png'].forEach(fileName => {
        for (const p of possiblePaths) {
            const fullPath = path.join(p, fileName);
            if (fs.existsSync(fullPath)) {
                foundFiles[fileName] = fullPath;
                break;
            }
        }
    });

    const resPath = 'android/app/src/main/res';
    if (fs.existsSync(resPath)) {
        // XML Adaptive Icon များကို ဖျက်ထုတ်ခြင်း
        const xmlPaths = ['mipmap-anydpi-v26/ic_launcher.xml', 'mipmap-anydpi-v26/ic_launcher_round.xml'];
        xmlPaths.forEach(xmlFile => {
            const fullXmlPath = path.join(resPath, xmlFile);
            if (fs.existsSync(fullXmlPath)) fs.unlinkSync(fullXmlPath);
        });

        // PNG များကို HD Solid Image နဲ့ အစားထိုးခြင်း
        const mipmapFolders = fs.readdirSync(resPath).filter(f => f.startsWith('mipmap-'));
        mipmapFolders.forEach(folder => {
            if (foundFiles['icon-only.png']) {
                ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'].forEach(name => {
                    fs.copyFileSync(foundFiles['icon-only.png'], path.join(resPath, folder, name));
                });
            }
        });

        // Splash Screen ထည့်သွင်းခြင်း
        const drawablePath = path.join(resPath, 'drawable');
        if (!fs.existsSync(drawablePath)) fs.mkdirSync(drawablePath, { recursive: true });
        if (foundFiles['splash.png']) {
            fs.copyFileSync(foundFiles['splash.png'], path.join(drawablePath, 'splash.png'));
        }
        console.log("🚀 Android Assets Patched Successfully!");
    }
}

/**
 * ၂။ ခင်ဗျားရဲ့ မူလ Model Discovery Logic (အမှန်)
 */
export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing!");
    console.log("🔍 Scanning for available generative models...");

    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResponse = await fetch(listUrl);
        const listData = await listResponse.json();

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
    } catch (e) { console.error(e.message); }
    throw new Error("No active model found.");
}

// ပတ်ချ်လုပ်ငန်းစဉ်ကို စတင်မယ်
try {
    patchAndroidProject();
} catch (e) {
    console.log("Patching skipped: " + e.message);
}
