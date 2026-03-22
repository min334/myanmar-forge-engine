import fs from 'fs';

async function forge() {
    console.log("🚀 စက်ရုံမှ ပစ္စည်းထုတ်ရန် ကုန်ကြမ်းများ ပြင်ဆင်နေသည်...");

    // ၁။ ဖုန်းထဲမှာ မြင်ရမည့် Controller UI
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
        h1 { color: #e94560; font-size: 24px; margin-bottom: 20px; }
        input, textarea { width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; border: none; background: #0f3460; color: white; box-sizing: border-box; font-size: 14px; }
        button { width: 100%; padding: 15px; border-radius: 8px; border: none; background: #e94560; color: white; font-weight: bold; cursor: pointer; font-size: 16px; margin-top: 10px; transition: 0.3s; }
        button:active { transform: scale(0.98); background: #c62842; }
        .log-box { margin-top: 20px; font-size: 12px; color: #95a5a6; background: #111; padding: 10px; border-radius: 5px; height: 100px; overflow-y: auto; text-align: left; border: 1px solid #333; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇲🇲 Forge Engine</h1>
        <p style="font-size: 13px; color: #bdc3c7;">AI-Powered Mobile App Builder</p>
        
        <input type="password" id="token" placeholder="GitHub Token (ghp_...)">
        <textarea id="idea" rows="4" placeholder="ဘယ်လို App မျိုး ထုတ်ချင်တာလဲ ရေးပါ..."></textarea>
        
        <button onclick="startForge()">🚀 Start Build Engine</button>
        
        <div class="log-box" id="logs">System: Standing by...</div>
    </div>

    <script>
        async function startForge() {
            const token = document.getElementById('token').value;
            const idea = document.getElementById('idea').value;
            const logs = document.getElementById('logs');
            
            if(!token || !idea) return alert("ကျေးဇူးပြု၍ အချက်အလက်များ ပြည့်စုံစွာ ဖြည့်ပါ။");
            
            logs.innerHTML += "<br>⏳ Connecting to GitHub Engine...";
            
            try {
                // repository နာမည် မှန်အောင် ပြန်စစ်ပေးပါ (ဥပမာ- min334/myanmar-forge-engine)
                const res = await fetch('https://api.github.com/repos/min334/myanmar-forge-engine/dispatches', {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + token, 
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        event_type: 'forge_build', 
                        client_payload: { app_idea: idea } 
                    })
                });

                if (res.status === 204) {
                    logs.innerHTML += "<br><span style='color:#2ecc71;'>✅ Success! APK building started.</span>";
                } else {
                    const data = await res.json();
                    logs.innerHTML += "<br><span style='color:#e74c3c;'>❌ Error: " + res.status + " " + (data.message || "") + "</span>";
                }
            } catch (e) {
                logs.innerHTML += "<br><span style='color:#e74c3c;'>🚨 Failed: " + e.message + "</span>";
            }
        }
    </script>
</body>
</html>`;

    // ၂။ APK အတွက် Configuration
    const manifest = {
        "name": "Myanmar Forge",
        "short_name": "Forge",
        "start_url": "index.html",
        "display": "standalone",
        "background_color": "#1a1a2e",
        "theme_color": "#e94560"
    };

    // ၃။ Capacitor အတွက် www folder ဆောက်ပြီး သိမ်းဆည်းခြင်း
    if (!fs.existsSync('www')) {
        fs.mkdirSync('www');
    }

    fs.writeFileSync('www/index.html', mainUI);
    fs.writeFileSync('www/manifest.json', JSON.stringify(manifest, null, 2));
    
    console.log("✅ www/index.html နှင့် www/manifest.json တို့ကို ထုတ်လုပ်ပြီးပါပြီ။");
}

forge();
