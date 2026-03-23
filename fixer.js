import fs from 'fs';
import path from 'path';

/**
 * ၁။ Deep Image & Manifest Patching Logic
 * (အိုင်ကွန်ဝါးခြင်းနှင့် Splash Screen မပေါ်ခြင်းကို ဖြေရှင်းရန်)
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
                console.log(`✅ Found ${fileName} at ${fullPath}`);
                break;
            }
        }
    });

    const resPath = 'android/app/src/main/res';
    if (fs.existsSync(resPath)) {
        // (က) Adaptive XML အဟောင်းများကို အကုန်လိုက်ဖျက်ပစ်ခြင်း (ဒါမှ PNG ကိုပဲ သေချာပေါက် သုံးမှာပါ)
        const xmlPaths = [
            'mipmap-anydpi-v26/ic_launcher.xml',
            'mipmap-anydpi-v26/ic_launcher_round.xml'
        ];
        xmlPaths.forEach(xmlFile => {
            const fullXmlPath = path.join(resPath, xmlFile);
            if (fs.existsSync(fullXmlPath)) {
                fs.unlinkSync(fullXmlPath);
                console.log(`🗑️ Deleted XML Icon: ${xmlFile}`);
            }
        });

        // (ခ) Mipmap Folders အားလုံးထဲက PNG တွေကို Solid HD Image နဲ့ အစားထိုးမယ်
        const mipmapFolders = fs.readdirSync(resPath).filter(f => f.startsWith('mipmap-'));
        mipmapFolders.forEach(folder => {
            if (foundFiles['icon-only.png']) {
                const names = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];
                names.forEach(name => {
                    fs.copyFileSync(foundFiles['icon-only.png'], path.join(resPath, folder, name));
                });
            }
        });

        // (ဂ) AndroidManifest.xml ကို PNG သုံးဖို့ အတင်းညွှန်ကြားခြင်း
        const manifestPath = 'android/app/src/main/AndroidManifest.xml';
        if (fs.existsSync(manifestPath)) {
            let manifest = fs.readFileSync(manifestPath, 'utf8');
            manifest = manifest.replace(/android:icon="[^"]*"/g, 'android:icon="@mipmap/ic_launcher"');
            manifest = manifest.replace(/android:roundIcon="[^"]*"/g, 'android:roundIcon="@mipmap/ic_launcher_round"');
            fs.writeFileSync(manifestPath, manifest);
            console.log("🚀 AndroidManifest.xml Patched to HD PNG mode!");
        }

        // (ဃ) Splash Screen ကို drawable folder ထဲ အတင်းထည့်ပေးခြင်း
        const drawablePath = path.join(resPath, 'drawable');
        if (!fs.existsSync(drawablePath)) fs.mkdirSync(drawablePath, { recursive: true });
        if (foundFiles['splash.png']) {
            fs.copyFileSync(foundFiles['splash.png'], path.join(drawablePath, 'splash.png'));
            console.log("🚀 HD Splash Screen Installed!");
        }
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
 * ၃။ Main Fixer Function
 */
async function runFixer() {
    try {
        if (!fs.existsSync('./www')) {
            fs.mkdirSync('./www', { recursive: true });
            fs.writeFileSync('./www/index.html', '<html><body>Myanmar Forge Engine Ready</body></html>');
        }

        if (!fs.existsSync('./capacitor.config.json')) {
            const config = {
                appId: 'com.minthitsar.forge',
                appName: 'Myanmar Forge Engine',
                webDir: 'www',
                bundledWebRuntime: false
            };
            fs.writeFileSync('./capacitor.config.json', JSON.stringify(config, null, 2));
        }

        // အိုင်ကွန်နှင့် Splash ပြင်ဆင်သည့် Function ကို ခေါ်ယူခြင်း
        patchAndroidProject();

    } catch (err) {
        console.log("🚨 Fixer Error: " + err.message);
    }
}

runFixer();
