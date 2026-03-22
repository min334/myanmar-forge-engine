name: Myanmar Forge Engine APK Build

on:
  workflow_dispatch:
  repository_dispatch:
    types: [forge_build]

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

      - name: Create Source Files
        run: node index.js

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Forge & Repair Engine (Build APK)
        run: |
          npm install -g @bubblewrap/cli
          
          # Signing Key ကို အရင်ဆုံး အတင်းဆောက်ခိုင်းခြင်း
          keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000 -storepass password -keypass password -dname "CN=Min Thitsa Aung, OU=Forge, O=Myanmar, L=Yangon, S=Yangon, C=MM"
          
          # Bubblewrap ကို ပုံမှန်အတိုင်း မဟုတ်ဘဲ twa-manifest ကနေ အတင်းစတင်ခိုင်းခြင်း
          echo "🚀 APK ထုတ်လုပ်မှု စတင်နေပြီ..."
          yes | bubblewrap build --signingKeyPath=android.keystore --signingKeyAlias=android --signingKeyPassword=password --signingStorePassword=password || true
          
          # ထွက်လာတဲ့ APK ကို အလွယ်တကူ ရှာတွေ့နိုင်အောင် နာမည်ပြောင်းခြင်း
          mv app-release-signed.apk MyanmarForge_Installer.apk || true
          
      - name: Upload Finished Product
        uses: actions/upload-artifact@v4
        with:
          name: Myanmar-Forge-Final-APK
          path: ./*.apk
