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
    
    // အိုင်ကွန်နှင့် Splash ပုံများကို ရှာဖွေခြင်း
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
        // (က) XML Adaptive အိုင်ကွန်ဟောင်းများကို အကုန်လိုက်ဖျက်ပစ်ခြင်း
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

        // (ခ) Mipmap Folders အားလုံးထဲက PNG တွေကို HD Solid Image နဲ့ အစားထိုးမယ်
        const mipmapFolders = fs.readdirSync(resPath).filter(f => f.startsWith('mipmap-'));
        mipmapFolders.forEach(folder => {
            if (foundFiles['icon-only.png']) {
                const names = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];
                names.forEach(name => {
                    const iconTargetPath = path.join(resPath, folder, name);
                    try {
                        fs.copyFileSync(foundFiles['icon-only.png'], iconTargetPath);
                    } catch (err) {
                        console.error(`🚨 Error copying icon to ${iconTargetPath}: ${err.message}`);
                    }
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

        // (ဃ) Splash Screen (Portrait Size) ကို drawable folder ထဲ ထည့်ပေးခြင်း
        const drawablePath = path.join(resPath, 'drawable');
        if (!fs.existsSync(drawablePath)) fs.mkdirSync(drawablePath, { recursive: true });
        if (foundFiles['splash.png']) {
            try {
                fs.copyFileSync(foundFiles['splash.png'], path.join(drawablePath, 'splash.png'));
                console.log("🚀 HD Splash Screen Installed!");
            } catch (err) {
                console.error(`🚨 Error copying splash screen: ${err.message}`);
            }
        }
    }
}

/**
 * ၂။ Main Fixer Function
 */
async function runFixer() {
    try {
        // Android Project ရှိမရှိ အရင်စစ်မယ်
        if (fs.existsSync('./android')) {
            patchAndroidProject();
        } else {
            console.log("⚠️ Android project not found. Skipping patching.");
        }
    } catch (err) {
        console.log("🚨 Fixer Error: " + err.message);
    }
}

runFixer();
