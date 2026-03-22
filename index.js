import fs from 'fs';

async function forge() {
    console.log("🚀 Creating Master Controller UI...");

    const mainUI = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myanmar Forge Controller</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .container { max-width: 450px; margin: auto; background: #16213e; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #e94560; }
        h1 { color: #e94560; font-size: 26px; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 2px; }
        label { display: block; margin-top: 15px; color: #add8e6; text-align: left; font-size: 14px; }
        input, textarea { width: 100%; padding: 14px; margin-top: 8px; border-radius: 10px; border: none; background: #0f3460; color: white; box-sizing: border-box; font-size: 16px; }
        button { width: 100%; padding: 16px; margin-top: 25px; border-radius: 10px; border: none; background: #e94560; color: white; font-weight: bold; font-size: 18px; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 15px rgba(233, 69, 96, 0.4); }
        button:hover { background: #ff4d6d; transform: translateY(-2px); }
        .log { margin-top: 25px; font-size: 12px; color: #95a5a6; background: #000; padding: 12px; border-radius: 8px; height: 110px; overflow-y: auto; text-align: left; border: 1px solid #333; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇲🇲 Forge Controller</h1>
        <label>GitHub Classic Token:</label>
        <input type="password" id="token" placeholder="ghp_xxxxxxxxxxxx">
        <label>App Idea (ဥပမာ - ရွှေစျေးတွက်စက်):</label>
        <textarea id="idea" rows="3" placeholder="ဘာ App ထုတ်ချင်သလဲ ရေးပါ..."></textarea>
        <button onclick="startForge()">🚀 Start Forge & Build APK</button>
        <div class="log" id="logs">System: Ready to forge new apps...</div>
    </div>
    <script>
        async function startForge() {
            const token = document.getElementById('token').value;
            const idea = document.getElementById('idea').value;
            const logs = document.getElementById('logs');
            if(!token || !idea) { alert("Please fill all fields!"); return; }
            logs.innerHTML += "<br>⏳ Connecting to GitHub API...";
            try {
                const res = await fetch('https://api.github.com/repos/min334/myanmar-forge-engine/dispatches', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'token ' + token,
                        'Accept': 'application/vnd.github.v3+json',
                    },
                    body: JSON.stringify({
                        event_type: 'forge_build',
                        client_payload: { app_idea: idea }
                    })
                });
                if (res.status === 204) {
                    logs.innerHTML += "<br>✅ <span style='color:#27ae60'>Success! GitHub is now building your APK.</span>";
                    logs.innerHTML += "<br>ℹ️ Please check Actions in 5-10 mins.";
                } else {
                    logs.innerHTML += "<br>❌ Error: " + res.status;
                }
            } catch (e) {
                logs.innerHTML += "<br>🚨 Connection Failed: " + e.message;
            }
        }
    </script>
</body>
</html>`;

    fs.writeFileSync('index.html', mainUI);
    console.log("✅ index.html is ready.");
}

forge();
