# Troubleshooting Checklist - AudioCraft Generation Failed

## ✅ Step-by-Step Debugging

### Step 1: Check API Key Configuration

**In Supabase Dashboard:**
1. Go to: Settings → Edge Functions → Secrets
2. Check if `HUGGINGFACE_API_KEY` exists
3. Verify the value starts with `hf_`
4. **If missing**: Add it with your Hugging Face token

**Get Hugging Face Token:**
1. Sign up/login at https://huggingface.co/
2. Go to https://huggingface.co/settings/tokens
3. Create new token with "read" permission
4. Copy the token (starts with `hf_...`)
5. Add to Supabase secrets

### Step 2: Check Edge Function Logs

**View Logs:**
1. Supabase Dashboard → Edge Functions → `generate-music`
2. Click "Logs" tab
3. Look for error messages

**Common Error Messages:**
- `HUGGINGFACE_API_KEY not configured` → API key is missing
- `401 Unauthorized` → API key is invalid
- `503 Service Unavailable` → Model is loading (wait 30 seconds)
- `400 Bad Request` → Request format issue
- `404 Not Found` → Model endpoint not available

### Step 3: Test the API Directly

**Test with curl:**
```bash
curl -X POST https://api-inference.huggingface.co/models/facebook/musicgen-large \
  -H "Authorization: Bearer YOUR_HUGGINGFACE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "happy upbeat pop song", "parameters": {"max_new_tokens": 256}, "options": {"wait_for_model": true}}'
```

**Expected Response:**
- Success: Binary audio data (WAV file)
- Error: JSON with error message

### Step 4: Check Browser Console

**In your browser:**
1. Open DevTools (F12)
2. Go to Console tab
3. Try generating music
4. Look for error messages

**Common Console Errors:**
- Network errors → Check API endpoint
- CORS errors → Check Supabase CORS settings
- Parse errors → Check response format

### Step 5: Verify Model Availability

**Check if model supports Inference API:**
- Visit: https://huggingface.co/facebook/musicgen-large
- Look for "Inference API" section
- **Note**: Large models (3.3B params) may require:
  - Paid Inference Endpoints
  - Custom deployment
  - Alternative providers (Replicate, etc.)

## 🔧 Quick Fixes

### Fix 1: API Key Not Set
```bash
# In Supabase Dashboard:
Settings → Edge Functions → Secrets → Add Secret
Name: HUGGINGFACE_API_KEY
Value: hf_your_token_here
```

### Fix 2: Deploy Updated Function
```bash
supabase functions deploy generate-music
```

### Fix 3: Check Function Status
```bash
supabase functions list
supabase functions logs generate-music
```

## 🚨 Common Issues

### Issue: "Model is loading" (503 error)
**Solution**: Wait 20-30 seconds and try again. First request loads the model.

### Issue: "401 Unauthorized"
**Solution**: Check your Hugging Face token is valid and has "read" permissions.

### Issue: "404 Not Found"
**Solution**: MusicGen might not be available via free Inference API. Consider:
- Using Replicate API instead
- Using a smaller model (musicgen-small)
- Deploying your own endpoint

### Issue: "400 Bad Request"
**Solution**: Request format might be wrong. Check the error details in logs.

## 📋 What Information to Provide

If still not working, provide:
1. Error message from browser console
2. Error message from Supabase logs
3. HTTP status code
4. Full error response body
5. Whether API key is set in Supabase

## 🎯 Next Steps

If Hugging Face doesn't work:
1. **Try Replicate API** (mentioned in original docs)
2. **Try smaller model**: `facebook/musicgen-small`
3. **Check Hugging Face Spaces** for working examples
4. **Use alternative**: Google's MusicLM or other APIs

