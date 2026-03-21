import { getActiveModel } from "./ai-engine.js";

async function forge() {
    const geminiKey = process.env.GEMINI_API_KEY;
    
    console.log("🔍 Testing your API Key now...");
    
    if (!geminiKey) {
        console.error("🚨 Error: GEMINI_API_KEY is NOT found in GitHub Secrets!");
        process.exit(1);
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ API Key is PERFECT! It is working now.");
        } else {
            // ဒီနေရာမှာ ဘာကြောင့် ပျက်တာလဲဆိုတာ အဖြေအတိအကျ ပေါ်လာပါလိမ့်မယ်
            console.error("❌ Google API Error Message:", data.error.message);
            console.error("❌ Error Status:", data.error.status);
            process.exit(1);
        }
    } catch (e) {
        console.error("🚨 Connection Error:", e.message);
        process.exit(1);
    }
}
forge();
