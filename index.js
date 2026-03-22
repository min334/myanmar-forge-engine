import fs from 'fs';

async function forge() {
    console.log("🚀 Generating Master Controller UI...");

    const mainUI = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myanmar Forge Controller</title>
    <style>
        body { font-family: sans-serif; background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .container { max-width: 400px; margin: auto; background: #16213e; padding: 25px; border-radius: 15px; border: 1px solid #e94560; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { color: #e94560; font-size: 24px; }
        input, textarea { width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; border: none; background: #0f3460; color: white; box-sizing: border-box; }
        button { width: 100%; padding: 15px; border-radius: 8px; border: none; background: #e94560; color: white; font-weight: bold; cursor: pointer; }
        .log { margin-top: 20px; font-size: 12px; color: #95a5a6; background: #111; padding: 10px; border-radius: 5px; height: 80px; overflow-y: auto; text-align: left; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇲🇲 Forge Controller</h1>
        <input type="password" id="token" placeholder="GitHub Token (ghp_...)">
        <textarea id="idea" rows="3" placeholder="App Idea (ဥပမာ - ရွှေစျေးတွက်စက်)"></textarea>
        <button onclick="startForge()">🚀 Start Forge & Build APK</button>
        <div class="log" id="logs">System: Ready to forge...</div>
    </div>
    <script>
        async function startForge() {
            const token = document.getElementById('token').value;
            const idea = document.getElementById('idea').value;
            const logs = document.getElementById('logs');
            if(!token || !idea) return alert("Fill all fields!");
            logs.innerHTML += "<br>⏳ Connecting to GitHub...";
            try {
                const res = await fetch('https://api.github.com/repos/min334/myanmar-forge-engine/dispatches', {
                    method: 'POST',
                    headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' },
                    body: JSON.stringify({ event_type: 'forge_build', client_payload: { app_idea: idea } })
                });
                if (res.status === 204) {
                    logs.innerHTML += "<br>✅ Success! Building APK...";
                } else {
                    logs.innerHTML += "<br>❌ Error: " + res.status;
                }
            } catch (e) { logs.innerHTML += "<br>🚨 Failed: " + e.message; }
        }
    </script>
</body>
</html>`;

    fs.writeFileSync('index.html', mainUI);
    // Web App ဖြစ်ကြောင်းပြသရန် manifest ဖိုင်လေးပါ တစ်ခါတည်း ဆောက်ပေးပါမယ်
    const manifest = {
        "name": "Myanmar Forge",
        "short_name": "Forge",
        "start_url": "index.html",
        "display": "standalone",
        "background_color": "#1a1a2e",
        "theme_color": "#e94560"
    };
    fs.writeFileSync('manifest.json', JSON.stringify(manifest));
    console.log("✅ index.html and manifest.json are ready.");
}
forge();
