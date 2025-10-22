# 🚀 Quick Google OAuth Setup (5 Minutes)

Follow these exact steps to enable real Google sign-in:

## Step 1: Get Your Extension ID

1. Open Chrome and go to: `chrome://extensions/`
2. Find **DhartiWallet** in the list
3. Copy the **Extension ID** (looks like: `abcdefghijklmnopqrstuvwxyz123456`)
4. Save it somewhere - you'll need it!

## Step 2: Google Cloud Console Setup

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Project name: `DhartiWallet`
4. Click **Create**

## Step 3: Enable APIs

1. In the left menu, go to: **APIs & Services** → **Library**
2. Search for: **"Google+ API"** or **"People API"**
3. Click on it → Click **Enable**

## Step 4: Configure OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Choose **External** → Click **Create**
3. Fill in:
   - **App name**: `DhartiWallet`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**
5. Click **Add or Remove Scopes**
6. Search and add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
7. Click **Update** → **Save and Continue**
8. Click **Save and Continue** again (skip test users)
9. Click **Back to Dashboard**

## Step 5: Create OAuth Credentials

1. Go to: **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. For **Application type**, select: **Chrome Extension**
4. **Name**: `DhartiWallet Extension`
5. **Item ID**: Paste your Extension ID from Step 1
6. Click **Create**
7. **IMPORTANT**: Copy the **Client ID** (looks like `123456789.apps.googleusercontent.com`)

## Step 6: Update manifest.json

1. Open: `dharti-wallet-extension/manifest.json`
2. Find this section:
```json
"oauth2": {
  "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
}
```

3. Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
4. Save the file

## Step 7: Reload Extension

1. Go to: `chrome://extensions/`
2. Find **DhartiWallet**
3. Click the **refresh/reload** icon (↻)
4. Open DhartiWallet
5. Click **"Continue with Google"**
6. You should see the real Google sign-in screen! 🎉

## Troubleshooting

### Error: "Access blocked: Authorization Error"
- Make sure you added your Extension ID correctly in Google Cloud Console
- Verify the Client ID in manifest.json is correct
- Wait 5 minutes for Google's changes to propagate

### Error: "OAuth2 not configured"
- Double-check manifest.json has the oauth2 section
- Make sure you reloaded the extension after editing manifest.json

### Error: "Invalid scope"
- Ensure you added both scopes in the OAuth consent screen
- Scopes must be: userinfo.email and userinfo.profile

## What Your Client ID Should Look Like

✅ CORRECT:
```json
"client_id": "123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com"
```

❌ WRONG:
```json
"client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
```

## Testing

After setup:
1. Click "Continue with Google"
2. You should see Google's real OAuth consent screen
3. Select your Google account
4. Grant permissions
5. You'll be signed in with your real profile!

---

**Need more help?** See the full guide: [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)

