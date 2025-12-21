# Setup Real Music Generation (Hugging Face API)

## 🎯 Goal

Switch from mock server (test tones) to real music generation using Hugging Face API via Supabase.

## ✅ What's Already Done

- ✅ Supabase function is created: `supabase/functions/generate-music/index.ts`
- ✅ Frontend code updated to use Supabase function
- ✅ All integration code is ready

## 🔑 Step 1: Get Hugging Face API Key (5 minutes)

1. **Sign up/Login** at https://huggingface.co/
   - Free account works fine

2. **Create API Token**:
   - Go to: https://huggingface.co/settings/tokens
   - Click "New token"
   - Name: `tunestory-musicgen`
   - Type: **Read** (read permission is enough)
   - Click "Generate token"
   - **Copy the token** (starts with `hf_...`)

## 🔧 Step 2: Add API Key to Supabase (2 minutes)

1. **Open Supabase Dashboard**:
   - Go to your project: https://supabase.com/dashboard
   - Select your TuneStory project

2. **Add Secret**:
   - Go to: **Settings** → **Edge Functions** → **Secrets**
   - Click **"Add new secret"**
   - Name: `HUGGINGFACE_API_KEY`
   - Value: Paste your token (starts with `hf_...`)
   - Click **"Save"**

## 🚀 Step 3: Deploy Edge Function (if not already deployed)

If you haven't deployed the function yet:

```bash
# Make sure you're in the project root
cd c:\Users\tylar\code\tunestory-vibes

# Deploy the function
supabase functions deploy generate-music
```

**Note**: If you don't have Supabase CLI installed, you can deploy via the dashboard:
- Go to: **Edge Functions** → **generate-music** → **Deploy**

## ✅ Step 4: Test It!

1. **Restart your frontend** (if running):
   ```bash
   # Stop current dev server (Ctrl+C)
   npm run dev
   ```

2. **Test the flow**:
   - Open: http://localhost:5173
   - Upload a photo
   - Click "Generate" mode
   - Click "Generate AI Music"
   - **Wait 30-60 seconds** (first request loads the model)
   - You should hear **real generated music**! 🎵

## 🎵 What to Expect

**Real Music Generation:**
- ⏱️ **First request**: 30-60 seconds (model loading)
- ⏱️ **Subsequent requests**: 15-30 seconds
- 🎵 **Quality**: Real AI-generated music (not test tones!)
- 📦 **Format**: WAV file, 32kHz sample rate
- 🎼 **Model**: AudioCraft MusicGen Large (Meta Research)

## 🐛 Troubleshooting

### Error: "HUGGINGFACE_API_KEY not configured"
- **Fix**: Make sure you added the secret in Supabase Dashboard
- **Check**: Settings → Edge Functions → Secrets → `HUGGINGFACE_API_KEY` exists

### Error: "401 Unauthorized"
- **Fix**: Check your API token is valid
- **Check**: Token starts with `hf_` and has "read" permission
- **Fix**: Regenerate token if needed

### Error: "503 Service Unavailable" or "Model is loading"
- **Fix**: This is normal! Wait 20-30 seconds and try again
- **Why**: First request loads the model (cold start)

### Error: "404 Not Found"
- **Possible**: MusicGen Large might not be available on free tier
- **Fix**: Try using `musicgen-small` or `musicgen-medium` in the function
- **Alternative**: Use Replicate API (see below)

## 🔄 Alternative: Use Replicate API (More Reliable)

If Hugging Face doesn't work, Replicate is more reliable:

1. **Get Replicate API Key**: https://replicate.com/account/api-tokens
2. **Update Supabase function** to use Replicate instead
3. **Cost**: ~$0.05 per generation (pay-per-use)

## 📊 Comparison

| Feature | Mock Server | Hugging Face API | Replicate API |
|---------|-------------|------------------|---------------|
| Setup | ✅ Done | ⚠️ Needs API key | ⚠️ Needs API key |
| Speed | ⚡ 1.5s | ⏱️ 30-60s | ⏱️ 15-30s |
| Quality | ❌ Test tones | ✅ Real music | ✅ Real music |
| Cost | ✅ Free | ✅ Free (1000/day) | 💰 ~$0.05/gen |
| Reliability | ✅ Always works | ⚠️ Can be slow | ✅ Very reliable |

## ✅ Checklist

- [ ] Got Hugging Face API token
- [ ] Added `HUGGINGFACE_API_KEY` to Supabase secrets
- [ ] Deployed `generate-music` function (if needed)
- [ ] Tested generation (wait 30-60s for first request)
- [ ] Heard real music! 🎵

---

**Once you add the API key, you'll get real music generation!** 🚀

The code is already updated to use Supabase function instead of the mock server.


