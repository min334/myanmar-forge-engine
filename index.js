import fs from 'fs';

async function forge() {
    console.log("🚀 စက်ပြင်ဆရာ Logic: ကုန်ကြမ်းဖိုင်များကို အချောသတ်နေသည်...");

    const mainUI = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myanmar Forge Controller</title>
    <style>
        body { font-family: sans-serif; background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .container { max-width: 400px; margin: auto; background: #16213e; padding: 25px; border-radius: 15px; border: 1px solid #e94560; }
        input, textarea { width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; border: none; background: #0f3460; color: white; box-sizing: border-box; }
        button { width: 100%; padding: 15px; border-radius: 8px; border: none; background: #e94560; color: white; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇲🇲 Forge Controller</h1>
        <input type="password" id="token" placeholder="GitHub Token">
        <textarea id="idea" rows="3" placeholder="App Idea..."></textarea>
        <button onclick="startForge()">🚀 Start Build</button>
        <div id="logs" style="margin-top:15px; font-size:12px; color:#95a5a6;">Ready...</div>
    </div>
    <script>
        async function startForge() {
            const token = document.getElementById('token').value;
            const idea = document.getElementById('idea').value;
            if(!token || !idea) return alert("ဖြည့်ပါ!");
            document.getElementById('logs').innerHTML = "⏳ Sending...";
            const res = await fetch('https://api.github.com/repos/min334/myanmar-forge-engine/dispatches', {
                method: 'POST',
                headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' },
                body: JSON.stringify({ event_type: 'forge_build', client_payload: { app_idea: idea } })
            });
            document.getElementById('logs').innerHTML = res.status === 204 ? "✅ Sent!" : "❌ Error: " + res.status;
        }
    </script>
</body>
</html>`;

    const manifest = {
        "name": "Myanmar Forge",
        "short_name": "Forge",
        "start_url": "index.html",
        "display": "standalone",
        "background_color": "#1a1a2e",
        "theme_color": "#e94560",
        "icons": [{"src": "https://raw.githubusercontent.com/min334/myanmar-forge-engine/main/icon.png", "sizes": "512x512", "type": "image/png"}]
    };

    const twaManifest = {
        "packageId": "com.minthitsar.forge",
        "host": "raw.githubusercontent.com",
        "name": "Myanmar Forge",
        "launcherName": "Forge",
        "display": "standalone",
        "themeColor": "#e94560",
        "navigationColor": "#1a1a2e",
        "backgroundColor": "#1a1a2e",
        "enableNotifications": false,
        "startUrl": "index.html",
        "iconUrl": "https://raw.githubusercontent.com/min334/myanmar-forge-engine/main/icon.png",
        "splashScreenFadeOutDuration": 300,
        "signingKey": { "path": "./android.keystore", "alias": "android" }
    };

    fs.writeFileSync('index.html', mainUI);
    fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
    fs.writeFileSync('twa-manifest.json', JSON.stringify(twaManifest, null, 2));
    console.log("✅ ဖိုင်အားလုံး အဆင်သင့်ဖြစ်ပါပြီ။");
}
forge();
