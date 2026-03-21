export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing in Secrets!");

    return {
        generateContent: async (prompt) => {
            // SDK ကို မသုံးဘဲ URL နဲ့ တိုက်ရိုက်ခေါ်တဲ့ နည်းလမ်းဖြစ်ပါတယ်
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                // Error message ကို ပိုမိုရှင်းလင်းစွာ ပြဖို့ logic
                throw new Error(data.error?.message || "Google API Direct Connection Failed");
            }

            return {
                response: {
                    text: () => data.candidates[0].content.parts[0].text
                }
            };
        }
    };
}
