import fs from 'fs';

async function forge() {
    const mainUI = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myanmar Forge - Digital Ghost</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root { 
            --neon-blue: #00f3ff; --dark-bg: #050a10; --panel-bg: rgba(10, 20, 30, 0.7);
            --text: #e0f2f1; --accent: #0066ff;
            --ghost-color: rgba(0, 243, 255, 0.5);
        }

        body { 
            background: var(--dark-bg); color: var(--text); font-family: 'Orbitron', sans-serif; 
            margin: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden;
            transition: 0.3s;
        }

        /* Server Room Background */
        .server-room {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-image: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)),
                              url('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
            background-size: cover; background-position: center; opacity: 0.1; z-index: -2;
        }

        /* Digital Ghost Effect */
        .ghost-container {
            position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
            width: 300px; height: 400px; z-index: -1; opacity: 0.6;
            filter: drop-shadow(0 0 20px var(--neon-blue));
            animation: ghost-float 6s infinite alternate ease-in-out;
        }
        .ghost-body {
            width: 100%; height: 100%; background: var(--ghost-color);
            clip-path: polygon(50% 0%, 100% 20%, 80% 100%, 20% 100%, 0% 20%);
            position: relative; overflow: hidden;
        }
        .ghost-body::before {
            content: "010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101";
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            color: var(--neon-blue); font-size: 8px; font-family: monospace;
            line-height: 1; opacity: 0.3; animation: binary-scroll 10s infinite linear;
        }

        /* Header */
        header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0, 243, 255, 0.2); }
        .logo { font-weight: 900; letter-spacing: 2px; color: var(--neon-blue); text-shadow: 0 0 10px var(--neon-blue); }
        .settings-btn { font-size: 22px; cursor: pointer; transition: 0.3s; color: var(--neon-blue); }
        .settings-btn:hover { transform: rotate(90deg); }

        /* Main Forge Area */
        .forge-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
        .input-core {
            width: 100%; max-width: 400px; background: var(--panel-bg); 
            border: 1px solid rgba(0, 243, 255, 0.3); border-radius: 10px; padding: 20px;
            box-shadow: 0 0 30px rgba(0, 243, 255, 0.1); backdrop-filter: blur(10px);
        }

        textarea { 
            width: 100%; background: transparent; border: 1px solid rgba(0, 243, 255, 0.2); 
            color: var(--text); padding: 15px; border-radius: 4px; font-family: sans-serif; resize: none; box-sizing: border-box;
            transition: 0.3s;
        }
        textarea:focus { border-color: var(--neon-blue); box-shadow: 0 0 10px rgba(0, 243, 255, 0.3); }

        .forge-btn {
            margin-top: 20px; width: 100%; padding: 15px; background: transparent;
            border: 1px solid var(--neon-blue); color: var(--neon-blue); font-weight: bold;
            text-transform: uppercase; cursor: pointer; transition: 0.3s;
            position: relative; overflow: hidden;
        }
        .forge-btn:hover { background: rgba(0, 243, 255, 0.1); box-shadow: 0 0 30px var(--neon-blue); }
        .forge-btn::after {
            content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: linear-gradient(transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg); transition: 0.5s; opacity: 0;
        }
        .forge-btn:hover::after { opacity: 1; transform: translate(100%, 100%) rotate(45deg); }

        /* Settings Sidebar */
        .sidebar {
            position: fixed; right: -100%; top: 0; width: 80%; max-width: 300px; height: 100%;
            background: rgba(10, 20, 30, 0.95); z-index: 100; transition: 0.4s; padding: 30px; border-left: 1px solid rgba(0, 243, 255, 0.2);
            backdrop-filter: blur(20px);
        }
        .sidebar.active { right: 0; }
        .sidebar h2 { color: var(--neon-blue); font-size: 18px; margin-bottom: 20px; }

        /* Status & Logs */
        .status-hub { margin-top: 20px; text-align: left; width: 100%; max-width: 400px; }
        .scan-line { height: 2px; background: var(--neon-blue); width: 0%; transition: 1s; box-shadow: 0 0 10px var(--neon-blue); }
        .data-explosion { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; }

        @keyframes ghost-float { 0% { transform: translate(-50%, 0); } 100% { transform: translate(-50%, 20px); } }
        @keyframes binary-scroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes data-particle { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0); } }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&display=swap" rel="stylesheet">
</head>
<body>
    <div class="server-room"></div>
    <div class="ghost-container">
        <div class="ghost-body"></div>
    </div>
    <canvas class="data-explosion" id="dataExplosion"></canvas>

    <header>
        <div class="logo">DIGITAL FORGE</div>
        <i class="fas fa-cog settings-btn" onclick="toggleSettings()"></i>
    </header>

    <div class="forge-container">
        <div class="input-core">
            <p id="label-idea" style="font-size: 12px; margin-bottom: 10px; color: var(--neon-blue); opacity: 0.7;">[ AWAITING DIGITAL BLUEPRINT ]</p>
            <textarea id="idea" rows="4" placeholder="Inject App Consciousness..."></textarea>
            <button class="forge-btn" id="buildBtn" onclick="startForge()">Initiate Awakening</button>
        </div>

        <div class="status-hub" id="statusBox" style="display:none;">
            <div id="buildStatus" style="font-size: 12px; margin-bottom: 5px;">SYNCING DATA STREAM...</div>
            <div class="scan-line" id="loader"></div>
            <div id="logs" style="font-size: 11px; margin-top: 10px; opacity: 0.7;">Waiting for input command.</div>
        </div>

        <div id="downloadArea" style="display:none; margin-top:20px;">
            <button class="forge-btn" style="border-color: #00ff88; color: #00ff88;" onclick="downloadAPK()">
                <i class="fas fa-download"></i> Retrieve Output
            </button>
        </div>
    </div>

    <div class="sidebar" id="sidebar">
        <i class="fas fa-times" style="float: right; cursor: pointer;" onclick="toggleSettings()"></i>
        <h2>CORE CONFIG</h2>
        <div style="margin-bottom: 20px;">
            <label style="font-size: 12px;">GITHUB ACCESS KEY</label>
            <input type="password" id="token" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,243,255,0.2); color: white; padding: 10px; margin-top: 5px;">
        </div>
        <div>
            <label id="label-lang" style="font-size: 12px;">INTERFACE LANG</label>
            <select id="lang" onchange="changeLang()" style="width: 100%; background: rgba(0,0,0,0.5); color: white; padding: 10px; border: 1px solid rgba(0,243,255,0.2);">
                <option value="en">English</option>
                <option value="mm">မြန်မာဘာသာ</option>
            </select>
        </div>
    </div>

    <script>
        const owner = 'min334';
        const repo = 'myanmar-forge-engine';
        let currentRunId = null;

        function toggleSettings() { document.getElementById('sidebar').classList.toggle('active'); }
        
        function changeLang() {
            const l = document.getElementById('lang').value;
            document.getElementById('label-idea').innerText = l === 'mm' ? '[ စနစ်အဆင်သင့်ဖြစ်ပါပြီ - အိုင်ဒီယာထည့်ပါ ]' : '[ AWAITING DIGITAL BLUEPRINT ]';
            document.getElementById('buildBtn').innerText = l === 'mm' ? 'စတင်ထုတ်လုပ်မည်' : 'Initiate Awakening';
        }

        async function startForge() {
            const token = document.getElementById('token').value;
            const idea = document.getElementById('idea').value;
            if(!token) return alert("System Error: Access Key Missing. Check Config.");
            
            document.getElementById('statusBox').style.display = 'block';
            document.getElementById('loader').style.width = '30%';
            document.getElementById('buildBtn').disabled = true;
            createExplosion();

            const res = await fetch(\`https://api.github.com/repos/\${owner}/\${repo}/dispatches\`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ event_type: 'forge_build', client_payload: { app_idea: idea } })
            });

            if(res.status === 204) {
                document.getElementById('logs').innerText = "Command Sent. Monitoring Data Stream...";
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
                document.getElementById('buildStatus').innerText = "CORE STATUS: " + run.status.toUpperCase();
                document.getElementById('loader').style.width = run.status === 'completed' ? '100%' : '70%';

                if(run.status === 'completed') {
                    clearInterval(timer);
                    if(run.conclusion === 'success') {
                        currentRunId = run.id;
                        document.getElementById('downloadArea').style.display = 'block';
                        createExplosion(); // Success explosion
                    }
                }
            }, 5000);
        }

        function downloadAPK() {
            window.open(\`https://github.com/\${owner}/\${repo}/actions/runs/\${currentRunId}\`, '_blank');
        }

        // Particle Explosion Effect
        const canvas = document.getElementById('dataExplosion');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        function createExplosion() {
            const particles = [];
            for(let i=0; i<50; i++) {
                particles.push({
                    x: canvas.width / 2, y: canvas.height / 2,
                    dx: (Math.random() - 0.5) * 20, dy: (Math.random() - 0.5) * 20,
                    size: Math.random() * 3,
                    life: 100
                });
            }
            animateExplosion(particles);
        }

        function animateExplosion(particles) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.x += p.dx; p.y += p.dy; p.life--;
                if(p.life > 0) {
                    ctx.fillStyle = \`rgba(0, 243, 255, \${p.life / 100})\`;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                } else { particles.splice(i, 1); }
            });
            if(particles.length > 0) { requestAnimationFrame(() => animateExplosion(particles)); }
        }
    </script>
</body>
</html>`;

    if (!fs.existsSync('www')) fs.mkdirSync('www');
    fs.writeFileSync('www/index.html', mainUI);
    console.log("✅ Holographic Digital Ghost UI Deployed!");
}
forge();
