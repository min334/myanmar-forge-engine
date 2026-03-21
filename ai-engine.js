export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing in Secrets!");

    // စမ်းသပ်မယ့် နည်းလမ်း (၆) မျိုးစလုံးကို စာရင်းသွင်းထားပါတယ်
    const strategies = [
        { ver: "v1beta", model: "gemini-1.5-flash" },
        { ver: "v1", model: "gemini-1.5-flash" },
        { ver: "v1beta", model: "gemini-1.5-pro" },
        { ver: "v1", model: "gemini-1.5-pro" },
        { ver: "v1beta", model: "gemini-pro" },
        { ver: "v1", model: "gemini-pro" }
    ];

    console.log("🛠️ Starting Full-Spectrum Recovery Mode...");

    for (const s of strategies) {
        try {
            const url = `https://generativelanguage.googleapis.com/${s.ver}/models/${s.model}:generateContent?key=${apiKey}`;
            
            // Connection ကို အရင်စမ်းမယ်
            const check = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
            });

            if (check.ok) {
                console.log(`✅ SUCCESS! Using Strategy: ${s.ver}/${s.model}`);
                return {
                    generateContent: async (prompt) => {
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                        });
                        const data = await res.json();
                        return { response: { text: () => data.candidates[0].content.parts[0].text } };
                    }
                };
            }
        } catch (e) {
            console.log(`❌ ${s.ver}/${s.model} failed, trying next...`);
        }
    }
    throw new Error("CRITICAL: All Gemini API strategies failed. Please verify Key in AI Studio.");
}
