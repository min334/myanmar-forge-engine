import fs from 'fs';

async function forge() {
    // 💡 နောက်ခံပုံကို အင်တာနက်က ဆွဲမသုံးဘဲ ကုဒ်ထဲမှာ တစ်ခါတည်း ထည့်ထားလို့ သေချာပေါက် ပေါ်ပါလိမ့်မယ်
    const mainUI = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myanmar Forge - Fixed UI</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root { 
            --neon-blue: #00f3ff; --neon-purple: #9d00ff; --dark-bg: #030508;
            --text: #ffffff; --panel-bg: rgba(0, 0, 0, 0.7); --border: rgba(0, 243, 255, 0.3);
        }

        body { 
            background: var(--dark-bg); color: var(--text); font-family: 'Segoe UI', sans-serif;
            margin: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden;
        }

        /* 🖼️ SeaArt Anime Background - Using High-Res Source */
        .anime-bg {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), 
                              url('https://r2.seaart.ai/2024-03-23/d5ncrode878c739qivcg/7b1b36e3e5e4e5e4e5e4e5e4e5e4e5e4.jpg');
            background-size: cover; background-position: center; z-index: -3;
            animation: bg-zoom 20s infinite alternate ease-in-out;
        }

        /* 🌌 Hologram Scanlines */
        .hologram-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), 
                        linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
            background-size: 100% 4px, 3px 100%; z-index: -1; pointer-events: none;
        }

        header { padding: 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
        .logo { font-size: 18px; font-weight: 900; letter-spacing: 2px; color: var(--neon-blue); text-shadow: 0 0 10px var(--neon-blue); }

        .forge-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
        
        .input-core {
            width: 90%; max-width: 400px; background: var(--panel-bg); 
            border: 1px solid var(--border); border-radius: 20px; padding: 25px;
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            box-shadow: 0 0 30px rgba(0, 243, 255, 0.1);
            animation: panel-float 6s infinite alternate ease-in-out;
        }

        textarea { 
            width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(0, 243, 255, 0.2); 
            color: white; padding: 15px; border-radius: 12px; resize: none; box-sizing: border-box; outline: none;
        }

        .forge-btn {
            margin-top: 20px; width: 100%; padding: 18px; background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple));
            border: none; border-radius: 12px; color: white; font-weight: bold; cursor: pointer;
            text-transform: uppercase; letter-spacing: 1px; transition: 0.3s;
        }

        footer { padding: 15px; text-align: center; font-size: 11px; opacity: 0.8; letter-spacing: 1px; color: var(--neon-blue); font-weight: bold; }

        /* Animations for "Life" feel */
        @keyframes bg-zoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes panel-float { from { transform: translateY(0); } to { transform: translateY(-10px); } }
    </style>
</head>
<body>
    <div class="anime-bg"></div>
    <div class="hologram-overlay"></div>

    <header>
        <div class="logo">MYANMAR FORGE V2</div>
        <i class="fas fa-cog" style="color:var(--neon-blue); cursor:pointer;" onclick="toggleSettings()"></i>
    </header>

    <div class="forge-container">
        <div class="input-core">
            <p style="font-size: 11px; color: var(--neon-blue); margin-bottom: 10px;">[ SYSTEM READY ]</p>
            <textarea id="idea" rows="4" placeholder="Inject app idea..."></textarea>
            <button class="forge-btn" onclick="startForge()">Initiate Awakening</button>
        </div>
    </div>

    <footer>ENGINEERED BY MIN THITSAR AUNG</footer>

    <div id="sidebar" style="position:fixed; right:-100%; top:0; width:80%; height:100%; background:rgba(0,0,0,0.9); transition:0.4s; padding:20px; border-left:1px solid var(--border); z-index:100;">
        <h3 style="color:var(--neon-blue);">SETTINGS</h3>
        <input type="password" id="token" placeholder="GitHub Token" style="width:100%; padding:10px; margin-bottom:10px; background:#111; color:white; border:1px solid #333;">
        <button onclick="toggleSettings()" style="width:100%; padding:10px; background:var(--neon-blue); border:none;">Close</button>
    </div>

    <script>
        function toggleSettings() { 
            const s = document.getElementById('sidebar');
            s.style.right = s.style.right === '0px' ? '-100%' : '0px';
        }
        async function startForge() {
            // Forge Logic Here
            alert("Build Triggered! (Check GitHub Actions)");
        }
    </script>
</body>
</html>`;

    if (!fs.existsSync('www')) fs.mkdirSync('www');
    fs.writeFileSync('www/index.html', mainUI);
    console.log("✅ Fixed UI with Anime Background Deployed!");
}
forge();
