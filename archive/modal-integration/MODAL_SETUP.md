# Modal + AudioCraft Setup Guide

This guide walks through deploying AudioCraft MusicGen on Modal and integrating it with TuneStory.

## 🎯 Overview

We've migrated from Hugging Face Inference API to Modal for better performance:
- **Before (Hugging Face)**: 30-60s generation time, cold starts, rate limits
- **After (Modal)**: 5-15s generation time, faster cold starts, no rate limits, better reliability

## 📋 Prerequisites

1. **Modal Account**: Sign up at [modal.com](https://modal.com)
2. **Python 3.8+**: For deploying Modal functions
3. **Supabase Account**: For Edge Functions (already set up)

## 🚀 Step 1: Setup Virtual Environment (Recommended)

```bash
# Create virtual environment (recommended to avoid conflicts)
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install Modal CLI
pip install modal
```

See `VENV_SETUP.md` for detailed virtual environment setup.

## 🔐 Step 1b: Authenticate Modal

```bash
# Authenticate (will open browser)
modal token new
```

This creates a token stored in `~/.modal/token.json`

## 📦 Step 2: Deploy Modal Function

Deploy the music generation function to Modal:

```bash
# From project root
modal deploy modal_musicgen.py
```

On first deploy, Modal will:
- Build the container image with AudioCraft dependencies
- Download the MusicGen model (~1.5GB)
- Create the HTTP endpoint

**Expected output:**
```
✓ Created objects.
  ├── 🔨 Created tunestory-musicgen
  └── 🌐 Created web endpoint: https://your-username--tunestory-musicgen-generate-music.modal.run
```

**Copy the endpoint URL** - you'll need it for the next step!

## 🔐 Step 3: Configure Supabase Secrets

Add the Modal endpoint URL to your Supabase Edge Function secrets:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Add new secret:
   - **Name**: `MODAL_API_URL`
   - **Value**: `https://your-username--tunestory-musicgen-generate-music.modal.run`
   - Click **Save**

**Note**: Replace `your-username` with your actual Modal username from the deploy output.

## 📤 Step 4: Deploy Updated Supabase Function

Deploy the updated Edge Function that calls Modal:

```bash
# Deploy the generate-music function
supabase functions deploy generate-music
```

## ✅ Step 5: Test the Integration

### Test Modal Endpoint Directly

```bash
curl -X POST https://your-username--tunestory-musicgen-generate-music.modal.run \
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
  "prompt": "calm peaceful ambient music with piano",
  "duration": 10,
  "sample_rate": 32000,
  "size_bytes": 640000,
  "generation_time_seconds": 8.5,
  "format": "wav"
}
```

### Test End-to-End (via Supabase)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-music \
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

## 🎛️ Configuration Options

### GPU Selection

In `modal_musicgen.py`, you can change the GPU type:

```python
@stub.cls(
    gpu="T4",  # Options: "T4", "A10G", "A100"
    ...
)
```

- **T4**: Cheapest, good for most cases (5-15s generation)
- **A10G**: Faster, better for production (3-8s generation)
- **A100**: Fastest, most expensive (2-5s generation)

### Model Size

In `modal_musicgen.py`, change the model size:

```python
self.model = MusicGen.get_pretrained('facebook/musicgen-small')
```

Options:
- `musicgen-small`: Fastest (5-10s), good quality
- `musicgen-medium`: Balanced (10-20s), better quality
- `musicgen-large`: Slowest (20-30s), best quality

### Container Warmup

Adjust container idle timeout to keep instances warm:

```python
container_idle_timeout=300,  # 5 minutes (default)
```

- Higher value = fewer cold starts but more cost
- Lower value = more cold starts but less cost

## 📊 Monitoring & Costs

### View Logs

```bash
# View Modal function logs
modal logs tunestory-musicgen

# View real-time logs
modal logs tunestory-musicgen --tail
```

### Monitor Costs

1. Go to [Modal Dashboard](https://modal.com/apps)
2. Select your app: `tunestory-musicgen`
3. View:
   - **Usage**: Request count, GPU time
   - **Costs**: Per-request pricing breakdown
   - **Performance**: Average generation times

### Cost Estimates

- **T4 GPU**: ~$0.01-0.03 per 30-second generation
- **A10G GPU**: ~$0.02-0.05 per 30-second generation
- **Container idle time**: Minimal cost (only when warm)

**Example**: 1000 generations/month with T4 = ~$10-30/month

## 🔧 Troubleshooting

### Issue: "MODAL_API_URL not configured"

**Solution**: Make sure you've added the secret in Supabase:
1. Check secret name is exactly `MODAL_API_URL`
2. Verify the URL is correct (no trailing slash)
3. Redeploy the Edge Function after adding secret

### Issue: Modal endpoint returns 500

**Check logs:**
```bash
modal logs tunestory-musicgen --tail
```

Common causes:
- Model loading timeout (first request only)
- Out of memory (try smaller model)
- GPU unavailable (wait or use different GPU)

### Issue: Slow generation times

**Solutions:**
1. Use `musicgen-small` instead of `medium`/`large`
2. Upgrade to A10G GPU
3. Reduce `duration` parameter
4. Check Modal dashboard for GPU availability

### Issue: Cold starts too slow

**Solutions:**
1. Increase `container_idle_timeout` (keeps containers warm longer)
2. Send periodic "keepalive" requests
3. Use Modal's "warm pool" feature (contact support)

## 🔄 Updating the Function

After making changes to `modal_musicgen.py`:

```bash
# Redeploy
modal deploy modal_musicgen.py

# The endpoint URL stays the same, no need to update Supabase secrets
```

## 🚨 Important Notes

1. **First Request**: May take 20-30s (model loading). Subsequent requests are faster.

2. **Rate Limits**: Modal doesn't enforce strict rate limits, but excessive concurrent requests may queue.

3. **Timeout**: Default timeout is 120s. For longer generations, increase in code.

4. **Model Caching**: Models are cached on GPU between requests within the same container.

5. **Security**: Modal endpoints are public by default. Consider adding authentication if needed.

## 📚 Resources

- [Modal Documentation](https://modal.com/docs)
- [AudioCraft Documentation](https://github.com/facebookresearch/audiocraft)
- [Modal MusicGen Example](https://modal.com/docs/examples/discord-musicgen)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🎉 Next Steps

Once deployed and tested:

1. ✅ Update frontend to handle new response format (if needed)
2. ✅ Monitor performance and costs
3. ✅ Optimize model size/GPU based on usage
4. ✅ Consider adding caching for repeated prompts
5. ✅ Set up error alerts/notifications

---

**Questions?** Check Modal logs or Supabase Edge Function logs for detailed error messages.

