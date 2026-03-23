import fs from 'fs';
import path from 'path';

/**
 * ၁။ Image & Manifest Patching Logic (အိုင်ကွန်နှင့် Splash ပြဿနာဖြေရှင်းရန်)
 */
function patchAndroidProject() {
    console.log("🎨 AI Patcher is deep-scanning Android project...");
    
    // ပုံတွေ ရှိနိုင်တဲ့နေရာတွေကို လိုက်ရှာမယ်
    const possiblePaths = ['./', './assets/', './assets/assets/'];
    const filesToFix = ['icon-only.png', 'splash.png'];
    const foundFiles = {};

    filesToFix.forEach(fileName => {
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
        // အိုင်ကွန်များကို အစားထိုးခြင်း (Adaptive icons ကိုပါ ထည့်သွင်းစဉ်းစားပြီး)
        const mipmapFolders = fs.readdirSync(resPath).filter(f => f.startsWith('mipmap-'));
        mipmapFolders.forEach(folder => {
            if (foundFiles['icon-only.png']) {
                // Adaptive icons တွေမှာ ic_launcher_foreground.png ကို သုံးတာမို့လို့ ဒါကိုပါ အစားထိုးမယ်
                const names = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];
                names.forEach(name => {
                    fs.copyFileSync(foundFiles['icon-only.png'], path.join(resPath, folder, name));
                });
            }
        });

        // Manifest ထဲမှာ အိုင်ကွန်အဟောင်း (xml) သုံးထားတာကို ပုံနဲ့ အတင်းအစားထိုးခိုင်းမယ်
        const manifestPath = 'android/app/src/main/AndroidManifest.xml';
        if (fs.existsSync(manifestPath)) {
            let manifest = fs.readFileSync(manifestPath, 'utf8');
            // အိုင်ကွန်အဟောင်း xml နေရာမှာ png ကို တိုက်ရိုက်ညွှန်းခိုင်းတာပါ
            manifest = manifest.replace(/android:icon="[^"]*"/g, 'android:icon="@mipmap/ic_launcher"');
            manifest = manifest.replace(/android:roundIcon="[^"]*"/g, 'android:roundIcon="@mipmap/ic_launcher_round"');
            fs.writeFileSync(manifestPath, manifest);
            console.log("🚀 AndroidManifest.xml Patched Successfully!");
        }

        // Splash Screen ကို အစားထိုးခြင်း
        const drawablePath = path.join(resPath, 'drawable');
        if (!fs.existsSync(drawablePath)) fs.mkdirSync(drawablePath, { recursive: true });
        if (foundFiles['splash.png']) {
            fs.copyFileSync(foundFiles['splash.png'], path.join(drawablePath, 'splash.png'));
            console.log("🚀 Splash screen patched!");
        }
    } else {
        console.log("⚠️ Android folder not found yet. Skipping deep patch.");
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
 * ၃။ Capacitor နှင့် App Fixer Logic
 */
async function runFixer() {
    try {
        // Missing directories check
        if (!fs.existsSync('./www')) {
            fs.mkdirSync('./www', { recursive: true });
            fs.writeFileSync('./www/index.html', '<html><body>Forge Engine Ready</body></html>');
        }

        if (!fs.existsSync('./capacitor.config.json')) {
            const config = {
                appId: 'com.minthitsar.goldcalc',
                appName: 'Myanmar Forge',
                webDir: 'www',
                bundledWebRuntime: false
            };
            fs.writeFileSync('./capacitor.config.json', JSON.stringify(config, null, 2));
        }

        // ပုံများအားလုံးကို အတင်းလိုက်ပြင်ခိုင်းခြင်း
        patchAndroidProject();

    } catch (err) {
        console.log("🚨 Fixer Execution Failed: " + err.message);
    }
}

runFixer();
