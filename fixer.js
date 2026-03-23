import fs from 'fs';
import path from 'path';

/**
 * ၁။ Deep Image & XML Patching Logic
 */
function patchAndroidProject() {
    console.log("🛠️ AI Patcher is executing XML Killer & Icon Force-Replace...");
    
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
        // (က) XML အိုင်ကွန်ဟောင်းများကို အကုန်လိုက်ဖျက်ပစ်ခြင်း (ဒါမှ PNG ကိုပဲ သုံးမှာပါ)
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

        // (ခ) PNG ပုံများကို အစားထိုးခြင်း
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
            console.log("🚀 AndroidManifest.xml Patched to PNG mode!");
        }

        // (ဃ) Splash Screen
        const drawablePath = path.join(resPath, 'drawable');
        if (!fs.existsSync(drawablePath)) fs.mkdirSync(drawablePath, { recursive: true });
        if (foundFiles['splash.png']) {
            fs.copyFileSync(foundFiles['splash.png'], path.join(drawablePath, 'splash.png'));
        }
    }
}

/**
 * ၂။ ကိုမင်းသစ္စာအောင် ပေးထားသော Smart Model Discovery Logic
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
            if (testRes.ok) {
                console.log(`✅ Ready: ${modelPath}`);
                return { generateContent: async (p) => { /* original logic */ } };
            }
        }
    } catch (e) { console.error(e.message); }
    throw new Error("No model found.");
}

/**
 * ၃။ Main Fixer Function
 */
async function runFixer() {
    try {
        if (!fs.existsSync('./www')) {
            fs.mkdirSync('./www', { recursive: true });
            fs.writeFileSync('./www/index.html', '<html><body>Forge Engine Ready</body></html>');
        }
        patchAndroidProject();
    } catch (err) {
        console.log("🚨 Fixer Error: " + err.message);
    }
}

runFixer();
