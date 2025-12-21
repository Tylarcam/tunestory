# Add Hugging Face API Key to Supabase

## ✅ Your Token
```
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
```

## 🚀 Quick Steps (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your **TuneStory** project

### Step 2: Add the Secret
1. In the left sidebar, click **"Edge Functions"**
2. Click **"Settings"** (or go to: Settings → Edge Functions → Secrets)
3. Scroll to **"Secrets"** section
4. Click **"Add new secret"** button
5. Fill in:
   - **Name**: `HUGGINGFACE_API_KEY`
   - **Value**: `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`
6. Click **"Save"** or **"Add secret"**

### Step 3: Verify
- You should see `HUGGINGFACE_API_KEY` in the secrets list
- Status should show as active/configured

## ✅ That's It!

Once you've added the secret:
1. **Refresh your frontend** (if running)
2. **Test generation**:
   - Upload a photo
   - Click "Generate" mode
   - Click "Generate AI Music"
   - Wait 30-60 seconds
   - You should hear **real generated music**! 🎵

## 🐛 If It Doesn't Work

**Error: "HUGGINGFACE_API_KEY not configured"**
- Double-check the secret name is exactly: `HUGGINGFACE_API_KEY`
- Make sure you clicked "Save" after adding it
- Try refreshing the page

**Error: "401 Unauthorized"**
- Verify the token is correct (starts with `hf_`)
- Check if token has "read" permission in Hugging Face

**Error: "503 Service Unavailable"**
- This is normal! The model is loading
- Wait 20-30 seconds and try again

---

**After adding the secret, your app will generate real music!** 🚀


