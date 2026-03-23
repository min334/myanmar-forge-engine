import fs from 'fs';

async function forge() {
    // 💡 SeaArt ကပုံကို Direct Link အဖြစ် ပြောင်းလဲပေးထားပါတယ်
    const animeBackgroundUrl = 'https://r2.seaart.ai/2024-03-23/d5ncrode878c739qivcg/7b1b36e3e5e4e5e4e5e4e5e4e5e4e5e4.jpg'; 

    const mainUI = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myanmar Forge - Digital Ghost Core</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root { 
            --neon-blue: #00f3ff; --neon-purple: #9d00ff; --dark-bg: #030508;
            --text: #ffffff; --panel-bg: rgba(0, 0, 0, 0.6); --border: rgba(0, 243, 255, 0.3);
        }

        body { 
            background: var(--dark-bg); color: var(--text); font-family: 'Segoe UI', sans-serif;
            margin: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden;
        }

        /* 🖼️ SeaArt Anime Background */
        .anime-bg {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.8)),
                              url('${animeBackgroundUrl}');
            background-size: cover; background-position: center; z-index: -2;
        }

        /* 🌌 Scanning Lines Effect */
        .hologram-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                        linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            background-size: 100% 4px, 3px 100%; z-index: -1; pointer-events: none;
        }

        header { padding: 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
        .logo { font-size: 18px; font-weight: 900; letter-spacing: 2px; color: var(--neon-blue); text-shadow: 0 0 10px var(--neon-blue); }
        .settings-btn { font-size: 20px; cursor: pointer; color: var(--neon-blue); }

        .forge-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
        
        .input-core {
            width: 90%; max-width: 400px; background: var(--panel-bg); 
            border: 1px solid var(--border); border-radius: 20px; padding: 25px;
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            box-shadow: 0 0 30px rgba(0, 243, 255, 0.1);
        }

        textarea { 
            width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(0, 243, 255, 0.2); 
            color: white; padding: 15px; border-radius: 12px; resize: none; box-sizing: border-box;
            outline: none; transition: 0.3s;
        }
        textarea:focus { border-color: var(--neon-blue); background: rgba(255,255,255,0.1); }

        .forge-btn {
            margin-top: 20px; width: 100%; padding: 15px; background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple));
            border: none; border-radius: 12px; color: white; font-weight: bold; cursor: pointer;
            text-transform: uppercase; letter-spacing: 1px; transition: 0.3s;
        }
        .forge-btn:hover { transform: scale(1.02); box-shadow: 0 0 20px var(--neon-blue); }

        .sidebar {
            position: fixed; right: -100%; top: 0; width: 80%; max-width: 300px; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 100; transition: 0.4s; padding: 30px; 
            border-left: 1px solid var(--border); backdrop-filter: blur(20px);
        }
        .sidebar.active { right: 0; }

        .status-hub { margin-top: 20px; text-align: left; width: 90%; max-width: 400px; }
        .loader-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; margin-top: 10px; }
        .scan-line { height: 100%; background: var(--neon-blue); width: 0%; transition: 1s; }
        
        footer { padding: 15px; text-align: center; font-size: 10px; opacity: 0.5; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="anime-bg"></div>
    <div class="hologram-overlay"></div>

    <header>
        <div class="logo">MYANMAR FORGE V2</div>
        <i class="fas fa-cog settings-btn" onclick="toggleSettings()"></i>
    </header>

    <div class="forge-container">
        <div class="input-core">
            <p style="font-size: 11px; color: var(--neon-blue); margin-bottom: 10px;">[ ENGINE STATUS: ONLINE ]</p>
            <textarea id="idea" rows="4" placeholder="Enter your app idea here..."></textarea>
            <button class="forge-btn" id="buildBtn" onclick="startForge()">Start Forge</button>
        </div>

        <div class="status-hub" id="statusBox" style="display:none;">
            <div id="buildStatus" style="font-size: 12px; color: var(--neon-blue);">// PROCESSING DATA...</div>
            <div class="loader-bar"><div class="scan-line" id="loader"></div></div>
            <div id="logs" style="font-size: 10px; margin-top: 8px; opacity: 0.7;">Initializing...</div>
        </div>

        <div id="downloadArea" style="display:none; margin-top:20px;">
            <button class="forge-btn" style="background: #00ff88; color: #000;" onclick="downloadAPK()">
                Download APK
            </button>
        </div>
    </div>

    <div class="sidebar" id="sidebar">
        <h3 style="color: var(--neon-blue);">SETTINGS</h3>
        <input type="password" id="token" placeholder="GitHub Token" style="width:100%; padding:10px; background:#222; border:1px solid #444; color:white; margin-bottom:10px;">
        <button onclick="toggleSettings()" style="width:100%; padding:10px; background:var(--neon-blue); border:none; cursor:pointer;">Close</button>
    </div>

    <footer>ENGINEERED BY MIN THITSAR AUNG</footer>

    <script>
        const owner = 'min334';
        const repo = 'myanmar-forge-engine';
        let currentRunId = null;

        function toggleSettings() { document.getElementById('sidebar').classList.toggle('active'); }

        async function startForge() {
            const token = document.getElementById('token').value;
            const idea = document.getElementById('idea').value;
            if(!token) return alert("Please enter GitHub Token in settings.");

            document.getElementById('statusBox').style.display = 'block';
            document.getElementById('loader').style.width = '30%';
            
            const res = await fetch(\`https://api.github.com/repos/\${owner}/\${repo}/dispatches\`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ event_type: 'forge_build', client_payload: { app_idea: idea } })
            });

            if(res.status === 204) {
                document.getElementById('logs').innerText = "Build Triggered! Checking status...";
                startTracking(token);
            }
        }

        async function startTracking(token) {
            const timer = setInterval(async () => {
                const res = await fetch(\`https://api.github.com/repos/\${owner}/\${repo}/actions/runs?per_page=1\`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await res.json();
                const run = data.workflow_runs[0];
                document.getElementById('buildStatus').innerText = "STATUS: " + run.status.toUpperCase();
                document.getElementById('loader').style.width = run.status === 'completed' ? '100%' : '70%';

                if(run.status === 'completed') {
                    clearInterval(timer);
                    if(run.conclusion === 'success') {
                        currentRunId = run.id;
                        document.getElementById('downloadArea').style.display = 'block';
                    }
                }
            }, 5000);
        }

        function downloadAPK() {
            window.open(\`https://github.com/\${owner}/\${repo}/actions/runs/\${currentRunId}\`, '_blank');
        }
    </script>
</body>
</html>`;

    if (!fs.existsSync('www')) fs.mkdirSync('www');
    fs.writeFileSync('www/index.html', mainUI);
    console.log("✅ SeaArt Anime UI Deployed!");
}
forge();
