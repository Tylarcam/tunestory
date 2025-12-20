# Modal Integration Quick Start

Quick reference for Modal + AudioCraft deployment.

## One-Time Setup

```bash
# 1. Install Modal
pip install modal

# 2. Authenticate
modal token new

# 3. Deploy function
modal deploy modal_musicgen.py

# 4. Copy endpoint URL from output, then add to Supabase secrets:
#    MODAL_API_URL=https://your-username--tunestory-musicgen-generate-music.modal.run
```

## Supabase Secret Setup

In Supabase Dashboard → Settings → Edge Functions → Secrets:

- **Name**: `MODAL_API_URL`
- **Value**: `https://your-username--tunestory-musicgen-generate-music.modal.run`

Then deploy the updated function:

```bash
supabase functions deploy generate-music
```

## Useful Commands

```bash
# View logs
modal logs tunestory-musicgen --tail

# Check function status
modal app list

# Redeploy after changes
modal deploy modal_musicgen.py

# Test endpoint directly
curl -X POST https://your-username--tunestory-musicgen-generate-music.modal.run \
  -H "Content-Type: application/json" \
  -d '{"prompt": "calm ambient music", "duration": 10}'
```

## Testing End-to-End

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-music \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "calm",
    "energy": 3,
    "genres": ["ambient"],
    "description": "peaceful scene"
  }'
```

See `MODAL_SETUP.md` for detailed documentation.

