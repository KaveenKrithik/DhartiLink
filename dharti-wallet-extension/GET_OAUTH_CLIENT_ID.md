# 🔑 How to Get OAuth Client ID - Step by Step

## Prerequisites
- Google account
- DhartiWallet extension loaded in Chrome

---

## 📋 Step-by-Step Guide

### STEP 1: Get Your Extension ID

1. Open Chrome
2. Type in address bar: `chrome://extensions/`
3. Press Enter
4. Find **DhartiWallet** in the list
5. Look for **ID:** under the extension name
6. **Copy the entire ID**

Example Extension ID:
```
abcdefghijklmnopqrstuvwxyz123456
```

**Keep this ID handy!** You'll need it in Step 4.

---

### STEP 2: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. Sign in with your Google account
3. If you don't have a project, you'll see "Select a project" at the top
4. Click **"New Project"** (or select existing project if you have one)

#### Creating a New Project:
- **Project name**: `DhartiWallet` (or any name)
- **Location**: Leave as default
- Click **CREATE**
- Wait a few seconds for project creation

---

### STEP 3: Enable Required APIs

1. Make sure your project is selected (check top bar)
2. Click the **☰ menu** (hamburger icon) on the left
3. Go to: **APIs & Services** → **Library**
4. In the search box, type: `People API`
5. Click on **Google People API**
6. Click **ENABLE**
7. Wait for it to enable

Alternative: You can also enable **Google+ API** (legacy but works)

---

### STEP 4: Configure OAuth Consent Screen

1. In the left menu, go to: **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have Google Workspace, then choose Internal)
3. Click **CREATE**

#### Fill in the form:

**App information:**
- **App name**: `DhartiWallet`
- **User support email**: Your email (select from dropdown)
- **App logo**: (optional - skip for now)

**App domain:** (optional - skip)

**Authorized domains:** (optional - skip)

**Developer contact information:**
- **Email addresses**: Your email

4. Click **SAVE AND CONTINUE**

#### Add Scopes:

5. Click **ADD OR REMOVE SCOPES**
6. In the filter box, search: `userinfo.email`
7. Check the boxes for:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
8. Click **UPDATE**
9. Click **SAVE AND CONTINUE**

#### Test users (for development):

10. Click **+ ADD USERS**
11. Enter your email address
12. Click **ADD**
13. Click **SAVE AND CONTINUE**

#### Summary:

14. Review and click **BACK TO DASHBOARD**

---

### STEP 5: Create OAuth 2.0 Client ID ⭐ (MOST IMPORTANT)

1. In the left menu, go to: **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** (at the top)
3. Select **OAuth client ID**

#### Configure the OAuth client:

**Application type:**
- Click the dropdown
- Select **Chrome app** or **Chrome extension**
- (Note: If you don't see this option, try "Desktop app" as fallback)

**Name:**
- Enter: `DhartiWallet Extension`

**Application ID / Item ID:**
- Paste your **Extension ID** from Step 1
- Example: `abcdefghijklmnopqrstuvwxyz123456`

4. Click **CREATE**

---

### STEP 6: Copy Your OAuth Client ID ✅

A popup will appear with your credentials:

**Your Client ID:**
```
123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```

**COPY THIS ENTIRE STRING!**

(You won't need the Client Secret for Chrome extensions)

Click **OK** to close the popup.

---

### STEP 7: Update manifest.json

1. Open your project folder: `dharti-wallet-extension`
2. Open file: `manifest.json`
3. Find this section:

```json
"oauth2": {
  "client_id": "YOUR_OAUTH_CLIENT_ID_HERE.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
},
```

4. Replace `YOUR_OAUTH_CLIENT_ID_HERE.apps.googleusercontent.com` with your actual Client ID:

```json
"oauth2": {
  "client_id": "123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
},
```

5. **SAVE** the file

---

### STEP 8: Reload Extension & Test 🎉

1. Go to: `chrome://extensions/`
2. Find **DhartiWallet**
3. Click the **↻ reload** button
4. Open DhartiWallet extension
5. Click **"Continue with Google"**
6. You should see the **REAL Google sign-in screen!**
7. Sign in with your Google account
8. Click **Allow** when asked for permissions
9. Your profile should appear in the wallet! ✨

---

## 🎯 What Your Client ID Should Look Like

### ✅ CORRECT Format:
```
123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```

Components:
- Project number: `123456789012` (12 digits)
- Hyphen: `-`
- Random string: `abc123def456ghi789jkl012mno345pq` (32 characters)
- Domain: `.apps.googleusercontent.com`

### ❌ WRONG - These are NOT OAuth Client IDs:
```
AIzaSyCVzTgaYCdrtau2c8WkVQSJjaruwjqDu1k  ← This is an API Key
YOUR_OAUTH_CLIENT_ID_HERE                  ← This is a placeholder
dharti-wallet-123456                       ← This is a project ID
```

---

## 🐛 Troubleshooting

### Problem: "Application type doesn't have Chrome App/Extension"

**Solution:**
1. Choose **"Desktop app"** instead
2. Or try **"Web application"**
3. Then add redirect URI: `https://<EXTENSION_ID>.chromiumapp.org/`

### Problem: "Access blocked: Authorization Error"

**Solution:**
1. Make sure Extension ID in Google Console matches exactly
2. Add yourself as a test user in OAuth consent screen
3. Wait 5-10 minutes for Google's changes to propagate

### Problem: "Error: invalid_client"

**Solution:**
1. Double-check you copied the ENTIRE Client ID
2. Make sure there are no extra spaces
3. Verify you're using the Client ID, not Client Secret

### Problem: "Redirect URI mismatch"

**Solution:**
1. For Chrome extensions, you don't need to configure redirect URIs manually
2. Make sure you selected "Chrome app" or "Chrome extension" as the application type
3. If you selected "Web application" by mistake, create a new OAuth client with the correct type

---

## 🔒 Security Notes

1. **Client ID is public** - It's okay if someone sees it
2. **Never share Client Secret** - Keep this private (not needed for extensions anyway)
3. **API Keys are different** - Don't confuse API keys with OAuth Client IDs
4. **Revoke if compromised** - You can delete and recreate OAuth clients anytime

---

## 📸 Visual Guide

### Where to find things:

**Google Cloud Console Locations:**
```
☰ Menu (left sidebar)
├── APIs & Services
│   ├── Library (enable APIs here)
│   ├── Credentials (create OAuth Client ID here)
│   └── OAuth consent screen (configure consent screen here)
```

**Chrome Extensions Page:**
```
chrome://extensions/
└── DhartiWallet
    └── ID: abcdefghijklmnopqrstuvwxyz123456  ← Copy this
```

---

## ✅ Success Checklist

- [ ] Got Extension ID from chrome://extensions/
- [ ] Created project in Google Cloud Console
- [ ] Enabled People API (or Google+ API)
- [ ] Configured OAuth consent screen
- [ ] Added scopes (userinfo.email, userinfo.profile)
- [ ] Created OAuth Client ID (Chrome app type)
- [ ] Copied the full Client ID
- [ ] Pasted Client ID in manifest.json
- [ ] Saved manifest.json
- [ ] Reloaded extension
- [ ] Tested Google sign-in
- [ ] Successfully signed in!

---

## 🎓 Summary

**In 3 sentences:**
1. Get your Extension ID from `chrome://extensions/`
2. Go to Google Cloud Console → Create OAuth Client ID → Choose "Chrome app" → Paste Extension ID
3. Copy the Client ID (looks like `123-abc.apps.googleusercontent.com`) → Put it in manifest.json → Reload extension

---

**Still stuck?** Common issue: Make sure you're creating an **OAuth Client ID**, NOT an API Key!

**Need more help?** Check the screenshots in the Google Cloud Console - each step shows exactly what you should click!

