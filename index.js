import { Octokit } from "@octokit/rest";

const appIdea = process.argv[2] || "Simple App";
const token = process.env.MY_GITHUB_TOKEN;
const octokit = new Octokit({ auth: token });

async function forge() {
    console.log(`🚀 Forging started for: ${appIdea}`);
    
    try {
        // ၁။ လက်ရှိ User ရဲ့ နာမည်ကို ယူမယ်
        const { data: user } = await octokit.users.getAuthenticated();
        console.log(`👤 Authenticated as: ${user.login}`);

        // ၂။ ဒီနေရာမှာ AI ဆီက Code တောင်းတဲ့အပိုင်း လာပါမယ် (လောလောဆယ် Sample Code ထည့်ထားမယ်)
        const appCode = `
            <h1>Success!</h1>
            <p>This App was forged by Myanmar Forge Engine based on: ${appIdea}</p>
        `;

        // ၃။ Target ဖိုင်ကို လက်ရှိ Repo ထဲမှာပဲ 'output-app.html' အနေနဲ့ အရင်စမ်းဆောက်ကြည့်မယ်
        await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: 'myanmar-forge-engine',
            path: 'output-app.html',
            message: `Forged: ${appIdea}`,
            content: Buffer.from(appCode).toString('base64'),
        });

        console.log("✅ New App forged successfully! Check 'output-app.html' in your repo.");
        
    } catch (error) {
        console.error("❌ Forge Error:", error.message);
    }
}

forge();
