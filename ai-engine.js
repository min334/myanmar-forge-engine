export async function getActiveModel(apiKey) {
    if (!apiKey) throw new Error("API Key is missing in Secrets!");

    return {
        generateContent: async (prompt) => {
            // v1beta version ကို URL မှာ အသေထည့်ထားပါတယ်
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
                throw new Error(data.error?.message || "Google API Error");
            }

            return {
                response: {
                    text: () => data.candidates[0].content.parts[0].text
                }
            };
        }
    };
}
