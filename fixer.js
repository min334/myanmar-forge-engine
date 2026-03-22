name: Myanmar Forge Engine APK Build

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: 🏗️ Factory Initializing
        run: |
          npm install
          npm install -g @bubblewrap/cli
          node index.js
          if [ ! -f "android.keystore" ]; then
            keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000 -storepass password -keypass password -dname "CN=Min Thitsa Aung, OU=Forge, O=Myanmar, L=Yangon, S=Yangon, C=MM"
          fi

      - name: 🚀 Build Attempt 1
        id: try1
        continue-on-error: true
        run: |
          # 'yes |' က မေးခွန်းတွေကို အလိုအလျောက် ဖြေပေးမှာပါ
          yes | bubblewrap build --signingKeyPath=android.keystore --signingKeyAlias=android --signingKeyPassword=password --signingStorePassword=password > error.log 2>&1

      - name: 🤖 AI Auto-Fix & Final Build
        if: steps.try1.outcome == 'failure'
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          node ai-engine.js
          # ဖိုင်ရှိမရှိ စစ်ဆေးပြီးမှ ဒုတိယအကြိမ် Build လုပ်ခြင်း
          if [ -f "twa-manifest.json" ]; then
            echo "✅ AI repair success. Re-building..."
            yes | bubblewrap build --signingKeyPath=android.keystore --signingKeyAlias=android --signingKeyPassword=password --signingStorePassword=password
          else
            echo "❌ AI failed to create manifest. Check your Gemini API Key."
            exit 1
          fi

      - name: 📦 Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: Forge-APK
          path: ./*.apk
