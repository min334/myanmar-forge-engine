import fs from 'fs';

async function generateApp() {
    const apiKey = process.env.GEMINI_API_KEY;
    const idea = process.env.APP_IDEA || "A simple hello world app";

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Create a professional single-file HTML5 mobile app for: ${idea}. Use CSS for styling and Vanilla JS for logic. Include Myanmar language if needed. Return ONLY the HTML code starting with <!DOCTYPE html>.` }] }]
            })
        });

        const data = await response.json();
        const rawCode = data.candidates[0].content.parts[0].text;
        
        // Markdown code blocks (```html) တွေကို ဖယ်ထုတ်ခြင်း
        const cleanCode = rawCode.replace(/```html|```/g, "").trim();

        if (!fs.existsSync('www')) fs.mkdirSync('www');
        fs.writeFileSync('www/index.html', cleanCode);
        console.log("✅ AI successfully forged the new app code!");
    } catch (e) {
        console.error("🚨 AI Generation Failed:", e.message);
        process.exit(1);
    }
}

generateApp();
