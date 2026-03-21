export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing in Secrets!");

    // Strategy List: ဒီ (၃) မျိုးထဲက အလုပ်လုပ်တာ တစ်ခုကို ရအောင် ရှာမယ်
    const strategies = [
        { ver: "v1beta", name: "gemini-1.5-flash" },
        { ver: "v1", name: "gemini-1.5-flash" },
        { ver: "v1beta", name: "gemini-pro" }
    ];

    console.log("🛠️ Initializing Multi-Strategy Recovery...");

    for (const s of strategies) {
        try {
            console.log(`🔍 Trying Strategy: ${s.ver} with ${s.name}...`);
            const url = `https://generativelanguage.googleapis.com/${s.ver}/models/${s.name}:generateContent?key=${apiKey}`;
            
            // တစ်ခါတည်း စမ်းသပ်ကြည့်မယ်
            const testResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
            });

            if (testResponse.ok) {
                console.log(`✅ Strategy Success: ${s.ver}/${s.name} is working!`);
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
            console.log(`❌ ${s.ver}/${s.name} failed, skipping...`);
        }
    }
    throw new Error("All strategies failed. Please check if your Gemini API Key is truly active.");
}
