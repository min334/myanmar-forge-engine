import fs from 'fs';
import path from 'path';

/**
 * ၁။ Image Patching Logic (အိုင်ကွန်နှင့် Splash Screen ကို AI စက်ရုပ်က အတင်းပြင်ပေးမည့်အပိုင်း)
 */
function patchAndroidImages() {
    console.log("🎨 AI Image Patcher is scanning for icons and splash screens...");
    
    // ပုံတွေ ရှိနိုင်တဲ့နေရာတွေကို လိုက်ရှာမယ်
    const possiblePaths = ['./', './assets/', './assets/assets/'];
    const filesToFix = ['icon-only.png', 'splash.png'];
    const foundFiles = {};

    filesToFix.forEach(fileName => {
        for (const p of possiblePaths) {
            const fullPath = path.join(p, fileName);
            if (fs.existsSync(fullPath)) {
                foundFiles[fileName] = fullPath;
                console.log(`✅ Found ${fileName} at ${fullPath}`);
                break;
            }
        }
    });

    const resPath = 'android/app/src/main/res';
    if (fs.existsSync(resPath)) {
        // အိုင်ကွန်များကို အစားထိုးခြင်း (Mipmap folders အားလုံးကို scan ဖတ်မယ်)
        const mipmapFolders = fs.readdirSync(resPath).filter(f => f.startsWith('mipmap-'));
        mipmapFolders.forEach(folder => {
            if (foundFiles['icon-only.png']) {
                const iconPath = path.join(resPath, folder, 'ic_launcher.png');
                const roundIconPath = path.join(resPath, folder, 'ic_launcher_round.png');
                fs.copyFileSync(foundFiles['icon-only.png'], iconPath);
                fs.copyFileSync(foundFiles['icon-only.png'], roundIconPath);
            }
        });
        console.log("🚀 Icons patched successfully in all densities!");

        // Splash Screen ကို အစားထိုးခြင်း
        const drawablePath = path.join(resPath, 'drawable');
        if (!fs.existsSync(drawablePath)) fs.mkdirSync(drawablePath, { recursive: true });
        if (foundFiles['splash.png']) {
            fs.copyFileSync(foundFiles['splash.png'], path.join(drawablePath, 'splash.png'));
            console.log("🚀 Splash screen patched successfully!");
        }
    } else {
        console.log("⚠️ Android folder not found yet. Skipping image patch.");
    }
}

/**
 * ၂။ ကိုမင်းသစ္စာအောင် ပေးထားသော Smart Model Discovery Logic (မူရင်းအတိုင်း)
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
 * ၃။ Capacitor Configuration များကို ပြင်ဆင်ပေးမည့် Logic (မူရင်းအတိုင်း)
 */
async function runFixer() {
    try {
        // ခင်ဗျားရဲ့ မူလ Config logic များ
        if (!fs.existsSync('./www')) {
            fs.mkdirSync('./www', { recursive: true });
            fs.writeFileSync('./www/index.html', '<html><body>Forge Engine Ready</body></html>');
            console.log("✅ Created missing 'www' directory and index.html");
        }

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

        // ပုံများကို အလိုအလျောက် ပြင်ဆင်သည့် Function ကို ခေါ်ယူခြင်း
        patchAndroidImages();

    } catch (err) {
        console.log("🚨 Fixer Execution Failed: " + err.message);
    }
}

runFixer();
