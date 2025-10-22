# ✅ Correct Google OAuth Setup for DhartiWallet

## ⚠️ IMPORTANT: API Key vs OAuth Client ID

**You DO NOT use an API Key for Chrome extension authentication!**

- ❌ **API Key**: `AIzaSyCVzTgaYCdrtau2c8WkVQSJjaruwjqDu1k` (Server-side only)
- ✅ **OAuth Client ID**: `123456789-abc123.apps.googleusercontent.com` (Chrome extension)

## Step-by-Step Guide

### 1️⃣ Get Your Extension ID

1. Open Chrome: `chrome://extensions/`
2. Find **DhartiWallet**
3. **Copy the Extension ID** (Example: `abcdefghijklmnopqrstuvwxyz123456`)

### 2️⃣ Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project (or create a new one)

### 3️⃣ Create OAuth 2.0 Credentials

1. Go to: **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth client ID**

#### Important Settings:

**Application type**: Select **Chrome Extension** from the dropdown

**Item ID**: Paste your Extension ID from Step 1
```
Example: abcdefghijklmnopqrstuvwxyz123456
```

**Name**: `DhartiWallet` (or any name)

4. Click **CREATE**

### 4️⃣ Copy Your Client ID

After creation, you'll see:

```
Client ID: 123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```

**Copy this entire Client ID!**

### 5️⃣ Configure OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Fill in:
   - **App name**: `DhartiWallet`
   - **User support email**: Your email
   - **Developer contact**: Your email

4. Click **SAVE AND CONTINUE**

### 6️⃣ Add Scopes

1. Click **ADD OR REMOVE SCOPES**
2. Search and select:
   - ✅ `../auth/userinfo.email`
   - ✅ `../auth/userinfo.profile`
3. Click **UPDATE**
4. Click **SAVE AND CONTINUE**

### 7️⃣ Update manifest.json

Open: `dharti-wallet-extension/manifest.json`

Replace this section:

```json
"oauth2": {
  "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
}
```

With your actual Client ID:

```json
"oauth2": {
  "client_id": "123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
}
```

### 8️⃣ Reload Extension & Test

1. Go to: `chrome://extensions/`
2. Click the **reload** icon (↻) on DhartiWallet
3. Open DhartiWallet
4. Click **"Continue with Google"**
5. You should see the real Google sign-in screen! 🎉

## ✅ What It Should Look Like

### Correct Client ID Format:
```
123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```

Components:
- Project number: `123456789012`
- Random string: `abc123def456ghi789jkl012mno345pq`
- Domain: `.apps.googleusercontent.com`

### Wrong Formats:
❌ `AIzaSyCVzTgaYCdrtau2c8WkVQSJjaruwjqDu1k` (This is an API key, not OAuth)
❌ `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` (Placeholder, not real)

## 🔧 Troubleshooting

### Error: "Invalid Client ID"
- Make sure you selected "Chrome Extension" as application type
- Verify the Extension ID matches exactly

### Error: "Access blocked"
- Check that you added the scopes in OAuth consent screen
- Make sure the extension is loaded in Chrome

### Error: "Redirect URI mismatch"
- This shouldn't happen with Chrome extensions
- Make sure you're using Chrome Identity API (not web OAuth flow)

## 🔒 Security Best Practices

1. **Never share your Client ID publicly** (it's okay if it leaks, but not recommended)
2. **NEVER share API keys** (revoke immediately if exposed)
3. **API keys** are for server-side use only
4. **OAuth Client IDs** are for user authentication
5. Keep your Client Secret secure (not needed for Chrome extensions)

## 📱 Testing

Once configured:

1. Click "Continue with Google"
2. Real Google OAuth screen appears
3. Select your Google account
4. Grant permissions
5. Your profile loads in the wallet!

---

**Need help?** The key difference:
- **API Key** = Server calls APIs
- **OAuth Client ID** = Users sign in

You need the OAuth Client ID, not the API key!

