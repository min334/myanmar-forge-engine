import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const appIdea = process.argv[2] || "Simple Gold Calculator App";
const githubToken = process.env.MY_GITHUB_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: githubToken });
const genAI = new GoogleGenerativeAI(geminiKey);

async function forge() {
    const flashModels = ["gemini-2.0-flash", "gemini-1.5-flash"];
    
    for (const modelName of flashModels) {
        try {
            console.log(`🤖 Attempting to use: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(`Generate a single HTML file with CSS and JS for: ${appIdea}. Return ONLY raw HTML code.`);
            const response = await result.response;
            let code = response.text().replace(/```html|```/g, "").trim();

            const { data: user } = await octokit.users.getAuthenticated();
            await octokit.repos.createOrUpdateFileContents({
                owner: user.login,
                repo: 'my-forged-app', 
                path: 'index.html',
                message: `Build via ${modelName}`,
                content: Buffer.from(code).toString('base64'),
            });
            console.log(`🎉 SUCCESS! App created with ${modelName}.`);
            return; 
        } catch (e) {
            console.log(`⚠️ ${modelName} failed: ${e.message}`);
        }
    }
}

forge();
