# Deployment Checklist - Modal + AudioCraft Integration

## ✅ Step 1: Modal App Deployed
- [x] Modal function deployed successfully
- [ ] Get Modal endpoint URL

## 📋 Step 2: Get Modal Endpoint URL

**Option A: From Modal Dashboard**
1. Go to https://modal.com/apps
2. Find and click on `tunestory-musicgen` app
3. Look for "Endpoints" section
4. Copy the URL (format: `https://YOUR-USERNAME--tunestory-musicgen-fastapi-app.modal.run`)

**Option B: From deployment output**
- The URL was shown when you ran `modal deploy modal_musicgen.py`
- Look for a line containing `.modal.run`

## 🔐 Step 3: Configure Supabase Secrets

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Add new secret:
   - **Name**: `MODAL_API_URL`
   - **Value**: Your Modal endpoint URL (from Step 2)
   - Click **Save**

## 📤 Step 4: Deploy Updated Supabase Function

From your project root directory:

```bash
supabase functions deploy generate-music
```

This deploys the updated function that calls Modal instead of Hugging Face.

## ✅ Step 5: Test the Integration

### Test 1: Test Modal Endpoint Directly

```bash
curl -X POST https://YOUR-MODAL-URL.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "calm peaceful ambient music with piano",
    "duration": 10,
    "temperature": 1.0
  }'
```

Expected response:
```json
{
  "success": true,
  "audio_base64": "UklGRiQAAABXQVZFZm10...",
  "prompt": "...",
  "duration": 10,
  ...
}
```

### Test 2: Test via Supabase Function

```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/generate-music \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "calm",
    "energy": 3,
    "genres": ["ambient"],
    "tempo_bpm": 65,
    "description": "peaceful morning scene"
  }'
```

### Test 3: Test from Frontend

1. Start your development server (if not running)
2. Upload a photo in your app
3. Click "Generate AI Music" button
4. Wait 5-15 seconds for generation
5. Music should play automatically

## 🐛 Troubleshooting

### Issue: "MODAL_API_URL not configured"
- Verify the secret name is exactly `MODAL_API_URL` (case-sensitive)
- Make sure you saved the secret after adding it
- Redeploy the Supabase function after adding the secret

### Issue: Modal endpoint returns 500
- Check Modal logs: `modal app logs tunestory-musicgen`
- Verify the endpoint URL is correct
- Make sure the Modal app is in "deployed" state

### Issue: Slow generation times
- First request may take 20-30s (model loading)
- Subsequent requests should be 5-15s
- Check Modal dashboard for GPU availability

### Issue: Frontend shows error
- Check browser console for error messages
- Verify Supabase function is deployed correctly
- Check Supabase function logs for details

## 📊 Monitoring

- **Modal Dashboard**: https://modal.com/apps - View usage, costs, logs
- **Supabase Dashboard**: View Edge Function logs and metrics
- **Browser Console**: Check for frontend errors

## 🎉 Success Criteria

- [ ] Modal endpoint responds successfully to test requests
- [ ] Supabase function calls Modal and returns audio
- [ ] Frontend can generate and play music
- [ ] Generation time is 5-15 seconds (after first request)

---

**Next**: Once everything is working, you're done! The integration is complete. 🎵

