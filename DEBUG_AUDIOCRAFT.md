# Debugging AudioCraft MusicGen Integration

## Common Issues and Solutions

### 1. Check Hugging Face API Key

**Issue**: `HUGGINGFACE_API_KEY not configured`

**Solution**:

- Go to Supabase Dashboard → Settings → Edge Functions → Secrets
- Add secret: `HUGGINGFACE_API_KEY` with value `hf_your_token_here`
- Get token from: https://huggingface.co/settings/tokens
- **Important**: Token must have "read" permissions

### 2. Check Edge Function Logs

View logs in Supabase Dashboard:

- Go to Edge Functions → generate-music → Logs
- Look for error messages starting with `❌`

Common errors you might see:

- `401 Unauthorized` → API key is invalid
- `503 Service Unavailable` → Model is loading (wait 20-30 seconds)
- `400 Bad Request` → Request format is incorrect
- `404 Not Found` → Model endpoint doesn't exist

### 3. MusicGen via Hugging Face Inference API Limitations

**Important**: The Hugging Face Inference API may not support MusicGen models directly. MusicGen models are large (3.3B parameters) and may require:

- Inference Endpoints (paid)
- Custom deployment
- Alternative API providers

### 4. Alternative: Use Replicate API (Recommended for Production)

Replicate is mentioned in the original docs as a production-ready option. Here's how to switch:

#### Update `supabase/functions/generate-music/index.ts`:

```typescript
// Option 1: Replicate API (More reliable)
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const REPLICATE_MODEL = 'meta/musicgen-large';

// Request format:
const response = await fetch(REPLICATE_API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    version: "model_version_id", // Get from Replicate
    input: {
      prompt: musicPrompt,
      duration: 30
    }
  })
});
```

### 5. Test the API Directly

Test if the Hugging Face API works:

```bash
curl -X POST https://api-inference.huggingface.co/models/facebook/musicgen-large \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "happy upbeat pop song"}'
```

### 6. Check Browser Console

Open browser DevTools → Console and look for:

- Network errors
- Response details
- Error messages from the frontend

### 7. Verify Request Format

The current request format might need adjustment. Check the actual error response body - it often contains helpful information about what's wrong.

## Quick Diagnostic Steps

1. ✅ Is `HUGGINGFACE_API_KEY` set in Supabase secrets?
2. ✅ Check edge function logs for specific error
3. ✅ Test API directly with curl (see above)
4. ✅ Verify model is available: https://huggingface.co/facebook/musicgen-large
5. ✅ Check if account has access to Inference API (some models require paid access)

## Next Steps

If Hugging Face Inference API doesn't work:

1. Consider using Replicate API (production-ready, pay-per-use)
2. Or use a different model that supports Inference API
3. Or deploy MusicGen yourself (requires GPU)
