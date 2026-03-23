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
    <title>Myanmar Forge - Life Core UI</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root { 
            --neon-blue: #00f3ff; --neon-purple: #9d00ff; --dark-bg: #030508;
            --text: #ffffff; --panel-bg: rgba(0, 0, 0, 0.5); --border: rgba(0, 243, 255, 0.2);
        }

        body { 
            background: var(--dark-bg); color: var(--text); font-family: 'Segoe UI', sans-serif;
            margin: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden;
            perspective: 1000px; /* For 3D Parallax */
        }

        /* 🖼️ 1. Animated Glitch & Floating Background */
        .anime-bg {
            position: fixed; top: -5%; left: -5%; width: 110%; height: 110%;
            background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('${animeBackgroundUrl}');
            background-size: cover; background-position: center; z-index: -3;
            filter: contrast(105%) brightness(95%);
            animation: bg-glitch 10s infinite alternate, bg-float 20s infinite alternate ease-in-out;
            will-change: transform;
        }

        /* 🌌 2. Particle Overlay (Floating Data) */
        .particle-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            z-index: -2; pointer-events: none;
        }

        header { padding: 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
        .logo { font-size: 18px; font-weight: 900; letter-spacing: 2px; color: var(--neon-blue); text-shadow: 0 0 15px var(--neon-blue); }
        .settings-btn { font-size: 20px; cursor: pointer; color: var(--neon-blue); transition: 0.3s; }
        .settings-btn:hover { transform: rotate(90deg); text-shadow: 0 0 10px var(--neon-blue); }

        .forge-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
        
        /* 🧊 Glassmorphism Core Panel */
        .input-core {
            width: 90%; max-width: 400px; background: var(--panel-bg); 
            border: 1px solid var(--border); border-radius: 24px; padding: 30px;
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            box-shadow: 0 0 40px rgba(0, 243, 255, 0.1), inset 0 0 15px rgba(255,255,255,0.02);
            transition: 0.3s; transform-style: preserve-3d;
        }

        textarea { 
            width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(0, 243, 255, 0.1); 
            color: white; padding: 18px; border-radius: 14px; resize: none; box-sizing: border-box;
            outline: none; transition: 0.3s; font-size: 14px; line-height: 1.6;
        }
        textarea:focus { border-color: var(--neon-blue); background: rgba(255,255,255,0.07); box-shadow: 0 0 15px rgba(0, 243, 255, 0.15); }

        .forge-btn {
            margin-top: 25px; width: 100%; padding: 18px; background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
            border: none; border-radius: 14px; color: white; font-weight: bold; cursor: pointer;
            text-transform: uppercase; letter-spacing: 2px; transition: 0.4s;
            position: relative; overflow: hidden; font-size: 15px;
        }
        .forge-btn:hover { transform: scale(1.03) translateY(-2px); box-shadow: 0 10px 30px rgba(0, 243, 255, 0.3); }
        .forge-btn::after {
            content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: linear-gradient(transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg); transition: 0.5s; opacity: 0;
        }
        .forge-btn:hover::after { opacity: 1; transform: translate(100%, 100%) rotate(45deg); }

        .sidebar {
            position: fixed; right: -100%; top: 0; width: 85%; max-width: 320px; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 100; transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1); padding: 40px 30px; 
            border-left: 1px solid var(--border); backdrop-filter: blur(20px);
        }
        .sidebar.active { right: 0; }
        .sidebar h2 { color: var(--neon-blue); font-size: 22px; margin-bottom: 30px; letter-spacing: 2px; }

        .status-hub { margin-top: 25px; text-align: left; width: 90%; max-width: 400px; font-size: 12px; }
        .loader-bar { height: 3px; background: rgba(255,255,255,0.05); width: 100%; border-radius: 2px; overflow: hidden; margin-top: 10px; }
        .scan-line { height: 100%; background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple)); width: 0%; transition: 1s; box-shadow: 0 0 15px var(--neon-blue); }
        
        footer { padding: 20px; text-align: center; font-size: 11px; opacity: 0.6; letter-spacing: 1.5px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); }
        .footer-name { color: var(--neon-blue); font-weight: bold; text-shadow: 0 0 10px var(--neon-blue); }

        /* Animations */
        @keyframes bg-glitch {
            0% { filter: contrast(105%) brightness(95%); transform: scale(1); }
            5% { filter: contrast(120%) brightness(110%); transform: scale(1.02); }
            10% { filter: contrast(105%) brightness(95%); transform: scale(1); }
            100% { filter: contrast(105%) brightness(95%); transform: scale(1); }
        }
        @keyframes bg-float {
            0% { background-position: center; }
            100% { background-position: calc(center + 10px) calc(center + 10px); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
</head>
<body id="mainBody">
    <div class="anime-bg" id="animeBg"></div>
    <div class="hologram-overlay"></div>
    <canvas class="particle-overlay" id="particles"></canvas>

    <header>
        <div class="logo">MYANMAR FORGE LIFE</div>
        <i class="fas fa-cog settings-btn" onclick="toggleSettings()"></i>
    </header>

    <div class="forge-container">
        <div class="input-core" id="corePanel">
            <p style="font-size: 11px; color: var(--neon-blue); margin-bottom: 12px; letter-spacing: 1px;">[ CORE SYSTEM: ACTIVE ]</p>
            <textarea id="idea" rows="5" placeholder="Inject your app consciousness here..."></textarea>
            <button class="forge-btn" id="buildBtn" onclick="startForge()">Initiate Awakening</button>
        </div>

        <div class="status-hub" id="statusBox" style="display:none; animation: fadeIn 0.5s forwards;">
            <div id="buildStatus" style="font-size: 13px; color: var(--neon-purple); letter-spacing: 1px;">// SYNCING DATA STREAM...</div>
            <div class="loader-bar"><div class="scan-line" id="loader"></div></div>
            <div id="logs" style="font-size: 11px; margin-top: 12px; opacity: 0.7; font-family: monospace;">Waiting for input command.</div>
        </div>

        <div id="downloadArea" style="display:none; margin-top:25px; animation: fadeIn 0.5s forwards;">
            <button class="forge-btn" style="background: #00ff88; color: #000; box-shadow: 0 0 20px rgba(0,255,136,0.2);" onclick="downloadAPK()">
                <i class="fas fa-download"></i> Retrieve Final Output
            </button>
        </div>
    </div>

    <div class="sidebar" id="sidebar">
        <i class="fas fa-times" style="float: right; cursor: pointer; color: var(--border);" onclick="toggleSettings()"></i>
        <h2>CORE CONFIG</h2>
        <div style="margin-bottom: 25px;">
            <label style="font-size: 11px; color: #666;">GITHUB ACCESS TOKEN</label>
            <input type="password" id="token" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: white; padding: 12px; margin-top: 8px; border-radius: 8px;">
        </div>
        <div>
            <label style="font-size: 11px; color: #666;">INTERFACE THEME</label>
            <button style="width: 100%; background: #111; color: white; border: 1px solid #333; padding: 12px; margin-top: 8px; border-radius: 8px; cursor: pointer;">
                Animated (Current)
            </button>
        </div>
    </div>

    <footer>ENGINEERED BY <span class="footer-name">MIN THITSAR AUNG</span> | V2.1 LIVE CORE</footer>

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
            document.getElementById('buildBtn').disabled = true;

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
                document.getElementById('buildStatus').innerText = run.status.toUpperCase();
                document.getElementById('loader').style.width = run.status === 'completed' ? '100%' : '70%';

                if(run.status === 'completed') {
                    clearInterval(timer);
                    if(run.conclusion === 'success') {
                        currentRunId = run.id;
                        document.getElementById('downloadArea').style.display = 'block';
                    } else {
                        document.getElementById('logs').innerText = "❌ Forge Failed. Check GitHub Logs.";
                        document.getElementById('buildBtn').disabled = false;
                    }
                }
            }, 5000);
        }

        function downloadAPK() {
            window.open(\`https://github.com/\${owner}/\${repo}/actions/runs/\${currentRunId}\`, '_blank');
        }

        // 🌟 JavaScript Feature 1: Floating Particles
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let particlesArray = [];

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                if(this.x > canvas.width) this.x = 0; else if(this.x < 0) this.x = canvas.width;
                if(this.y > canvas.height) this.y = 0; else if(this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = Math.random() > 0.5 ? '#00f3ff55' : '#9d00ff55';
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }

        function initParticles() { for(let i=0; i<50; i++) { particlesArray.push(new Particle()); } }
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for(let i=0; i<particlesArray.length; i++) { particlesArray[i].update(); particlesArray[i].draw(); }
            requestAnimationFrame(animateParticles);
        }
        initParticles(); animateParticles();

        // 🌟 JavaScript Feature 2: 3D Parallax Effect (Mouse/Gyro)
        const animeBg = document.getElementById('animeBg');
        const corePanel = document.getElementById('corePanel');

        if(window.DeviceOrientationEvent) { // For Phone Gyroscope
            window.addEventListener('deviceorientation', (e) => {
                const rotationY = Math.min(Math.max(e.gamma, -15), 15) / 2; // Left/Right
                const rotationX = Math.min(Math.max(e.beta - 45, -15), 15) / 2; // Top/Bottom
                animeBg.style.transform = \`translate3d(\${rotationY * 2}px, \${rotationX * 2}px, -10px)\`;
                corePanel.style.transform = \`rotateY(\${rotationY}deg) rotateX(\${\-rotationX}deg)\`;
            });
        } else { // Fallback for Mouse
            window.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                animeBg.style.transform = \`translate3d(\${x}px, \${y}px, -10px)\`;
                corePanel.style.transform = \`rotateY(\${x}deg) rotateX(\${\-y}deg)\`;
            });
        }
    </script>
</body>
</html>`;

    if (!fs.existsSync('www')) fs.mkdirSync('www');
    fs.writeFileSync('www/index.html', mainUI);
    console.log("✅ Live Animated UI Deployed!");
}
forge();
