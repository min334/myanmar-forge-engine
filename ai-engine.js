export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing in Secrets!");

    console.log("🔍 Scanning for ALL available generative models...");

    try {
        // ၁။ အရင်ဆုံး သုံးလို့ရသမျှ Model List ကို Google ဆီက တောင်းမယ်
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResponse = await fetch(listUrl);
        const listData = await listResponse.json();

        if (!listResponse.ok) {
            throw new Error(listData.error?.message || "Failed to fetch model list");
        }

        // ၂။ "generateContent" လုပ်နိုင်တဲ့ model တွေကိုပဲ သီးသန့်စစ်ထုတ်မယ်
        const availableModels = listData.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name);

        console.log(`📋 Found ${availableModels.length} potential models.`);

        // ၃။ အလုပ်လုပ်တဲ့ model တွေ့တဲ့အထိ တစ်ခုချင်းစီ စမ်းမယ်
        for (const modelName of availableModels) {
            try {
                console.log(`🧪 Testing: ${modelName}...`);
                const testUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
                
                const testRes = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                });

                if (testRes.ok) {
                    console.log(`✅ Success! Active Model found: ${modelName}`);
                    
                    // အလုပ်လုပ်တဲ့ model ကို return ပြန်ပေးမယ်
                    return {
                        generateContent: async (prompt) => {
                            const res = await fetch(testUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                            });
                            const data = await res.json();
                            return { response: { text: () => data.candidates[0].content.parts[0].text } };
                        }
                    };
                }
            } catch (err) {
                continue; // fail ရင် နောက်တစ်ခု ထပ်စမ်းမယ်
            }
        }
    } catch (e) {
        console.error("🚨 Discovery Error:", e.message);
    }
    
    throw new Error("Could not find any active generative model in this API Key.");
}
