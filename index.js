import fs from 'fs';

async function forge() {
    const mainUI = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myanmar Forge V2</title>
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

        /* 🖼️ Background Image - GitHub က Assets ထဲကပုံကို သုံးဖို့ ပြင်ထားပါတယ် */
        .anime-bg {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            /* Note: GitHub Pages သို့မဟုတ် Raw link ပြောင်းဖို့ လိုနိုင်ပါတယ် */
            background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), 
                              url('https://raw.githubusercontent.com/min334/myanmar-forge-engine/main/assets/splash.png');
            background-size: cover; background-position: center; z-index: -3;
            animation: bg-zoom 15s infinite alternate ease-in-out;
        }

        .hologram-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
                        linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
            background-size: 100% 3px, 3px 100%; z-index: -1; pointer-events: none;
        }

        header { padding: 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); z-index: 10; }
        .logo { font-size: 18px; font-weight: 900; letter-spacing: 2px; color: var(--neon-blue); text-shadow: 0 0 10px var(--neon-blue); }

        .forge-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; z-index: 5; }
        
        .input-core {
            width: 90%; max-width: 400px; background: var(--panel-bg); 
            border: 1px solid var(--border); border-radius: 20px; padding: 25px;
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 0 30px rgba(0, 243, 255, 0.2);
            animation: panel-float 5s infinite alternate ease-in-out;
        }

        textarea { 
            width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(0, 243, 255, 0.3); 
            color: white; padding: 15px; border-radius: 12px; resize: none; box-sizing: border-box; outline: none; font-size: 16px;
        }

        .forge-btn {
            margin-top: 20px; width: 100%; padding: 18px; background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple));
            border: none; border-radius: 12px; color: white; font-weight: bold; cursor: pointer;
            text-transform: uppercase; letter-spacing: 1px; transition: 0.3s;
        }
        .forge-btn:active { transform: scale(0.98); }

        footer { padding: 15px; text-align: center; font-size: 10px; opacity: 0.8; letter-spacing: 1px; color: var(--neon-blue); font-weight: bold; background: rgba(0,0,0,0.4); }

        /* Settings Sidebar */
        #sidebar { 
            position: fixed; right: -100%; top: 0; width: 85%; height: 100%; 
            background: rgba(3, 5, 8, 0.95); transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
            padding: 30px; border-left: 1px solid var(--border); z-index: 100;
            backdrop-filter: blur(15px);
        }

        @keyframes bg-zoom { from { transform: scale(1); } to { transform: scale(1.15); } }
        @keyframes panel-float { from { transform: translateY(0); } to { transform: translateY(-15px); } }
    </style>
</head>
<body>
    <div class="anime-bg"></div>
    <div class="hologram-overlay"></div>

    <header>
        <div class="logo">MYANMAR FORGE V2</div>
        <i class="fas fa-bars" style="color:var(--neon-blue); font-size: 20px; cursor:pointer;" onclick="toggleSettings()"></i>
    </header>

    <div class="forge-container">
        <div class="input-core">
            <p style="font-size: 11px; color: var(--neon-blue); margin-bottom: 10px; font-weight: bold;">
                <i class="fas fa-terminal"></i> SYSTEM READY...
            </p>
            <textarea id="idea" rows="4" placeholder="Inject your application consciousness..."></textarea>
            <button class="forge-btn" onclick="startForge()">Initiate Awakening</button>
        </div>
    </div>

    <footer>BY MIN THITSAR AUNG | ENGINE v2.1</footer>

    <div id="sidebar">
        <h2 style="color:var(--neon-blue); border-bottom: 1px solid var(--border); padding-bottom: 10px;">CORE CONFIG</h2>
        <div style="margin-top: 20px;">
            <label style="font-size: 12px; color: var(--neon-blue);">GITHUB TOKEN</label>
            <input type="password" id="token" placeholder="Paste your token here" style="width:100%; padding:15px; margin: 10px 0; background:#111; color:white; border:1px solid var(--border); border-radius: 8px;">
        </div>
        <button onclick="toggleSettings()" style="width:100%; padding:15px; background:transparent; border:1px solid var(--neon-blue); color: var(--neon-blue); border-radius: 8px; margin-top: 20px;">CLOSE INTERFACE</button>
    </div>

    <script>
        function toggleSettings() { 
            const s = document.getElementById('sidebar');
            s.style.right = (s.style.right === '0px' || s.style.right === '0%') ? '-100%' : '0px';
        }
        
        async function startForge() {
            const idea = document.getElementById('idea').value;
            if(!idea) return alert("System requires input data!");
            
            // UI Feedback
            const btn = document.querySelector('.forge-btn');
            btn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Processing...';
            btn.disabled = true;

            setTimeout(() => {
                alert("Build Triggered! Accessing GitHub API...");
                btn.innerHTML = 'Initiate Awakening';
                btn.disabled = false;
            }, 2000);
        }
    </script>
</body>
</html>`;

    if (!fs.existsSync('www')) fs.mkdirSync('www');
    fs.writeFileSync('www/index.html', mainUI);
    console.log("✅ Final Checked UI Deployed Successfully!");
}
forge();
