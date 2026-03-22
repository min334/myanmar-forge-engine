import fs from 'fs';

async function forge() {
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
        h1 { color: #e94560; font-size: 24px; margin: 0 0 20px 0; }
        input, textarea { width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; border: none; background: #0f3460; color: white; box-sizing: border-box; font-size: 14px; }
        button { width: 100%; padding: 15px; border-radius: 8px; border: none; background: #e94560; color: white; font-weight: bold; cursor: pointer; font-size: 16px; margin-top: 10px; transition: 0.3s; }
        button:disabled { background: #555; cursor: not-allowed; }
        .status-badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; margin-top: 10px; background: #34495e; }
        .log-box { margin-top: 20px; font-size: 13px; color: #ecf0f1; background: #111; padding: 15px; border-radius: 8px; min-height: 80px; text-align: left; border: 1px solid #333; line-height: 1.6; }
        #downloadArea { margin-top: 15px; display: none; }
        .download-btn { background: #2ecc71 !important; text-decoration: none; display: block; padding: 15px; border-radius: 8px; color: white; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇲🇲 Forge Engine</h1>
        <input type="password" id="token" placeholder="GitHub Token (ghp_...)">
        <textarea id="idea" rows="3" placeholder="App Idea..."></textarea>
        
        <button id="buildBtn" onclick="startForge()">🚀 Start Build Engine</button>
        
        <div id="statusInfo" style="display:none;">
            <div class="status-badge" id="buildStatus">Status: Unknown</div>
        </div>

        <div class="log-box" id="logs">System: Ready to forge...</div>

        <div id="downloadArea">
            <a id="apkLink" href="#" class="download-btn">📥 Download Final APK</a>
        </div>
    </div>

    <script>
        const owner = 'min334';
        const repo = 'myanmar-forge-engine';
        let checkInterval;

        async function startForge() {
            const token = document.getElementById('token').value;
            const idea = document.getElementById('idea').value;
            const logs = document.getElementById('logs');
            const btn = document.getElementById('buildBtn');

            if(!token || !idea) return alert("Please fill all fields.");

            btn.disabled = true;
            logs.innerHTML = "⏳ Triggering GitHub Action...";

            try {
                const res = await fetch(\`https://api.github.com/repos/\${owner}/\${repo}/dispatches\`, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json' },
                    body: JSON.stringify({ event_type: 'forge_build', client_payload: { app_idea: idea } })
                });

                if (res.status === 204) {
                    logs.innerHTML = "✅ Action Triggered! Waiting for build to start...";
                    document.getElementById('statusInfo').style.display = 'block';
                    // 10 စက္ကန့်နေရင် status စစ်ဖို့ စတင်မယ်
                    setTimeout(() => startTracking(token), 10000);
                } else {
                    logs.innerHTML = "❌ Failed: " + res.status;
                    btn.disabled = false;
                }
            } catch (e) {
                logs.innerHTML = "🚨 Error: " + e.message;
                btn.disabled = false;
            }
        }

        async function startTracking(token) {
            const logs = document.getElementById('logs');
            const statusBadge = document.getElementById('buildStatus');

            checkInterval = setInterval(async () => {
                try {
                    const res = await fetch(\`https://api.github.com/repos/\${owner}/\${repo}/actions/runs?per_page=1\`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const data = await res.json();
                    const run = data.workflow_runs[0];

                    statusBadge.innerText = "Status: " + run.status.toUpperCase();
                    logs.innerHTML = "🔨 Build is " + run.status + "...";

                    if (run.status === 'completed') {
                        clearInterval(checkInterval);
                        if (run.conclusion === 'success') {
                            logs.innerHTML = "🎉 Build Success! Fetching APK...";
                            fetchArtifact(token, run.id);
                        } else {
                            logs.innerHTML = "❌ Build Failed. Check GitHub Logs.";
                            document.getElementById('buildBtn').disabled = false;
                        }
                    }
                } catch (e) { console.log(e); }
            }, 5000);
        }

        async function fetchArtifact(token, runId) {
            const logs = document.getElementById('logs');
            try {
                const res = await fetch(\`https://api.github.com/repos/\${owner}/\${repo}/actions/runs/\${runId}/artifacts\`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await res.json();
                if (data.artifacts.length > 0) {
                    const apk = data.artifacts[0];
                    // GitHub Artifact က zip အနေနဲ့ ဒေါင်းရမှာပါ
                    const downloadUrl = \`https://github.com/\${owner}/\${repo}/suites/\${apk.check_suite_id}/artifacts/\${apk.id}\`;
                    
                    document.getElementById('apkLink').href = \`https://api.github.com/repos/\${owner}/\${repo}/actions/artifacts/\${apk.id}/zip\`;
                    // GitHub API artifact download က redirection လိုအပ်လို့ link ကို တိုက်ရိုက်ပေးတာ ပိုကောင်းပါတယ်
                    document.getElementById('apkLink').onclick = () => {
                        window.open(\`https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`, '_blank');
                        alert("Please download the Artifact from the GitHub page for security reasons.");
                    };
                    
                    document.getElementById('downloadArea').style.display = 'block';
                    logs.innerHTML = "✅ APK is ready for download!";
                }
            } catch (e) { logs.innerHTML = "🚨 Artifact Error: " + e.message; }
        }
    </script>
</body>
</html>`;

    if (!fs.existsSync('www')) fs.mkdirSync('www');
    fs.writeFileSync('www/index.html', mainUI);
    console.log("✅ Controller UI with Live Tracking & Download is ready!");
}
forge();
