# Quick Implementation Checklist
## AudioCraft + Modal Fast Deployment

**Estimated Time**: 30-45 minutes  
**Difficulty**: Intermediate  
**Prerequisites**: Modal account, Supabase project

---

## ✅ Pre-Flight Checklist

- [ ] Modal account created ([modal.com](https://modal.com))
- [ ] Supabase project with Edge Functions enabled
- [ ] Python 3.8+ installed
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Git installed (for AudioCraft)

---

## 🚀 Deployment Steps

### 1. Local Setup (5 min)

```bash
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# or: source venv/bin/activate  # macOS/Linux

# Install Modal
pip install modal

# Authenticate
modal token new
```

**Verify**: `modal app list` should work

---

### 2. Create Modal Function (5 min)

**File**: `modal_musicgen.py`

Copy from `AUDIOCRAFT_MODAL_ARCHITECTURE_BLUEPRINT.md` Step 2 (Minimal Version)

Or use existing file: `modal_musicgen.py` ✅

---

### 3. Deploy Modal (10-15 min)

```bash
modal deploy modal_musicgen.py
```

**⚠️ COPY THE ENDPOINT URL FROM OUTPUT**
```
🌐 Created web endpoint: https://your-username--app-name-fastapi-app.modal.run
```

**Note**: First deploy takes longer (builds image + downloads model ~1.5GB)

---

### 4. Configure Supabase Secret (2 min)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Settings → Edge Functions → Secrets
3. Add secret:
   - **Name**: `MODAL_API_URL`
   - **Value**: `https://your-username--app-name-fastapi-app.modal.run` (from step 3)

---

### 5. Create Edge Function (5 min)

**File**: `supabase/functions/generate-music/index.ts`

Use existing file ✅ or copy minimal version from blueprint.

**Key points**:
- Validates request with Zod
- Calls Modal API
- Returns audio as data URL

---

### 6. Deploy Edge Function (2 min)

```bash
# Link project (first time only)
supabase link --project-ref your-project-ref

# Deploy
supabase functions deploy generate-music
```

---

### 7. Test (2 min)

**Test Modal directly**:
```bash
curl -X POST https://your-username--app-name-fastapi-app.modal.run \
  -H "Content-Type: application/json" \
  -d '{"prompt": "calm ambient music", "duration": 10}'
```

**Test via Supabase**:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-music \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "upbeat electronic music", "duration": 30}'
```

**Expected**: JSON with `audio_base64` field

---

## 🔧 Configuration Options

### Change Model Size

**File**: `modal_musicgen.py` line ~79

```python
# Options: 'small', 'medium', 'large'
self.model = MusicGen.get_pretrained('facebook/musicgen-medium')
```

### Change GPU

**File**: `modal_musicgen.py` line ~58

```python
@app.cls(gpu="A10G", ...)  # Options: "T4", "A10G", "A100"
```

### Change Container Warmup

**File**: `modal_musicgen.py` line ~60

```python
scaledown_window=600,  # Keep warm for 10 minutes (default: 300)
```

---

## 📊 Monitoring

```bash
# Modal logs
modal logs your-app-name --tail

# Supabase logs
supabase functions logs generate-music --tail

# Modal dashboard
open https://modal.com/apps
```

---

## 🐛 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| `MODAL_API_URL not configured` | Add secret in Supabase Dashboard |
| Modal 503 error | Wait 10-30s (model loading) |
| Slow generation | Use `musicgen-small` or upgrade to A10G GPU |
| Deploy fails | Check Python version (3.8+) and Modal token |

---

## 📝 Next Steps

After successful deployment:

1. [ ] Test with frontend integration
2. [ ] Monitor costs in Modal dashboard
3. [ ] Add error retry logic (optional)
4. [ ] Implement prompt caching (optional)
5. [ ] Tune model size/GPU based on usage

---

## 📚 Full Documentation

See `AUDIOCRAFT_MODAL_ARCHITECTURE_BLUEPRINT.md` for:
- Complete architecture explanation
- System flow diagrams
- Detailed optimizations
- Best practices

---

**Status**: Ready to deploy ✅

