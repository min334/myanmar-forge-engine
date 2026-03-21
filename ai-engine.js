export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing in Secrets!");

    console.log("🔍 Scanning for any available generative models...");

    try {
        // ၁။ သုံးလို့ရသမျှ Model တွေရဲ့ List ကို အရင်တောင်းမယ်
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResponse = await fetch(listUrl);
        const listData = await listResponse.json();

        if (!listResponse.ok) {
            throw new Error(listData.error?.message || "Failed to fetch model list");
        }

        // ၂။ generateContent လုပ်လို့ရမယ့် model တွေကိုပဲ စစ်ထုတ်ယူမယ်
        const availableModels = listData.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name);

        console.log(`📋 Found ${availableModels.length} potential models on your account.`);

        // ၃။ အလုပ်လုပ်တဲ့ model တွေ့တဲ့အထိ တစ်ခုချင်းစီ စမ်းသပ်မယ်
        for (const modelPath of availableModels) {
            try {
                console.log(`🧪 Testing: ${modelPath}...`);
                const testUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
                
                const testRes = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                });

                if (testRes.ok) {
                    console.log(`✅ Success! Active Model found and ready: ${modelPath}`);
                    
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
                continue; // fail ရင် နောက်တစ်ခုကို ဆက်စမ်းမယ်
            }
        }
    } catch (e) {
        console.error("🚨 Discovery Error:", e.message);
    }
    
    throw new Error("Could not find any active model. Please check if your API Key is restricted.");
}
