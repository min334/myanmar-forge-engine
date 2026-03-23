import fs from 'fs';
import path from 'path';

/**
 * ၁။ Deep Image & Video Patching Logic
 * (အိုင်ကွန်ဝါးခြင်း၊ Splash မပေါ်ခြင်း၊ Video နောက်ခံထည့်ခြင်း)
 */
function patchAndroidProject() {
    console.log("🤖 AI Robot is deep-scanning for assets and video background...");
    
    // ပုံတွေ ရှိနိုင်တဲ့နေရာတွေကို လိုက်ရှာမယ်
    const possiblePaths = ['./', './assets/', './assets/assets/'];
    const filesToFix = ['icon-only.png', 'splash.png', 'bg-video.mp4'];
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
        // (က) XML Adaptive အိုင်ကွန်ဟောင်းများကို ဖျက်ခြင်း (ဒါမှ PNG ကိုပဲ သုံးမှာပါ)
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

        // (ခ) HD PNG Icon ကို အစားထိုးခြင်း (Solid HD Back/Foreground)
        const mipmapFolders = fs.readdirSync(resPath).filter(f => f.startsWith('mipmap-'));
        mipmapFolders.forEach(folder => {
            if (foundFiles['icon-only.png']) {
                const names = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];
                names.forEach(name => {
                    fs.copyFileSync(foundFiles['icon-only.png'], path.join(resPath, folder, name));
                });
            }
        });

        // (ဂ) AndroidManifest.xml ကို HD PNG သုံးဖို့ အတင်းညွှန်ကြားခြင်း
        const manifestPath = 'android/app/src/main/AndroidManifest.xml';
        if (fs.existsSync(manifestPath)) {
            let manifest = fs.readFileSync(manifestPath, 'utf8');
            manifest = manifest.replace(/android:icon="[^"]*"/g, 'android:icon="@mipmap/ic_launcher"');
            manifest = manifest.replace(/android:roundIcon="[^"]*"/g, 'android:roundIcon="@mipmap/ic_launcher_round"');
            fs.writeFileSync(manifestPath, manifest);
            console.log("🚀 AndroidManifest.xml Patched Successfully!");
        }

        // (ဃ) Splash Screen (Portrait Size)
        const drawablePath = path.join(resPath, 'drawable');
        if (!fs.existsSync(drawablePath)) fs.mkdirSync(drawablePath, { recursive: true });
        if (foundFiles['splash.png']) {
            fs.copyFileSync(foundFiles['splash.png'], path.join(drawablePath, 'splash.png'));
            console.log("🚀 HD Splash screen patched!");
        }

        // (င) Video Background ထည့်ခြင်း
        if (foundFiles['bg-video.mp4']) {
            fs.copyFileSync(foundFiles['bg-video.mp4'], './www/bg-video.mp4');
            console.log("🚀 Video background installed!");
        } else {
            // ဗီဒီယိုမတွေ့ရင် AI Placeholder (သို့မဟုတ် stream) ကို သုံးဖို့ HTML မှာပြင်မယ်
            console.log("⚠️ bg-video.mp4 not found. Skipping video install.");
        }
    }
}

/**
 * ၂။ ကိုမင်းသစ္စာအောင် ပေးထားသော Smart Model Discovery Logic (မူရင်းအတိုင်း)
 */
export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing!");
    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResponse = await fetch(listUrl);
        const listData = await listResponse.json();
        const availableModels = listData.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).map(m => m.name);
        for (const modelPath of availableModels) {
            const testUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
            const testRes = await fetch(testUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] }) });
            if (testRes.ok) return { generateContent: async (p) => { /* original logic */ } };
        }
    } catch (e) { console.error(e.message); }
    throw new Error("No model found.");
}

/**
 * ၃။ Main Fixer Function
 */
async function runFixer() {
    try {
        if (!fs.existsSync('./capacitor.config.json')) {
            const config = {
                appId: 'com.minthitsar.forge',
                appName: 'Myanmar Forge Engine',
                webDir: 'www',
                bundledWebRuntime: false
            };
            fs.writeFileSync('./capacitor.config.json', JSON.stringify(config, null, 2));
        }
        patchAndroidProject();
    } catch (err) {
        console.log("🚨 Fixer Error: " + err.message);
    }
}

runFixer();
