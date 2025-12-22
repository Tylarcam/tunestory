# MVP Testing Guide - MusicGen Integration

## ✅ Current Status

**Mock server is running and ready for testing!**

The mock server at `http://localhost:8000` is currently running and will generate test audio (simple tones) for MVP testing.

## 🚀 Quick Start - Test Your MVP Now

1. **Start your frontend** (if not already running):
   ```bash
   npm run dev
   # or
   bun dev
   ```

2. **Mock server is already running** at `http://localhost:8000`

3. **Test the flow**:
   - Open your app in browser
   - Upload a photo
   - Switch to "Generate" mode
   - Click "Generate AI Music"
   - You should see a test audio track (simple tone)

## 🎯 For Real Music Generation

You have **3 options**:

### Option 1: Use Mock Server (Current - Fastest for MVP)
- ✅ Already working
- ✅ Fast responses (~1.5 seconds)
- ⚠️ Generates simple test tones (not real music)
- **Best for**: UI/UX testing, demo videos

### Option 2: Use Supabase Function (Real Music - No Local Setup)
- ✅ Already configured in your codebase
- ✅ Uses Hugging Face API (real music generation)
- ⚠️ Requires `HUGGINGFACE_API_KEY` in Supabase secrets
- **Best for**: Production deployment, real music generation

To use this:
1. Get Hugging Face API key: https://huggingface.co/settings/tokens
2. Add to Supabase: Dashboard → Settings → Edge Functions → Secrets
3. The frontend will automatically fall back to Supabase if local server is down

### Option 3: Install AudioCraft Locally (Real Music - Local)
- ✅ Full control, no API costs
- ⚠️ Requires Visual C++ Build Tools installation
- ⚠️ Large download (~2-3GB)
- **Best for**: Development, learning, offline use

## 🔧 Installing Visual C++ Build Tools (For Option 3)

If you want to install AudioCraft locally:

1. **Download Visual C++ Build Tools**:
   - Visit: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Download "Build Tools for Visual Studio"
   - Run installer

2. **Select workload**:
   - Check "Desktop development with C++"
   - Click "Install" (~6GB download)

3. **After installation, restart terminal and install AudioCraft**:
   ```bash
   pip install audiocraft
   ```

4. **Run real server**:
   ```bash
   python musicgen_server.py
   ```

## 📊 Comparison

| Feature | Mock Server | Supabase Function | Local AudioCraft |
|---------|-------------|-------------------|------------------|
| Setup Time | ✅ 0 min | ✅ 5 min | ⚠️ 30-60 min |
| Real Music | ❌ No | ✅ Yes | ✅ Yes |
| Speed | ✅ Fast (1.5s) | ⚠️ Slow (30-60s) | ⚠️ Slow (30-60s) |
| Cost | ✅ Free | ⚠️ API costs | ✅ Free |
| Offline | ✅ Yes | ❌ No | ✅ Yes |
| Best For | MVP Testing | Production | Development |

## 🎬 Recommended MVP Testing Flow

1. **Now**: Use mock server for UI/UX testing
2. **Demo**: Record video with mock server (fast, works perfectly)
3. **Production**: Use Supabase function with Hugging Face API
4. **Later**: Install AudioCraft locally if you want full control

## ✅ Your Mock Server Status

The mock server is currently running at `http://localhost:8000`

Test it:
```bash
curl http://localhost:8000/health
```

You should see:
```json
{"status":"healthy","device":"cpu","model_loaded":true,"mode":"mock"}
```

## 🐛 Troubleshooting

### Mock server not responding?
```bash
# Check if it's running
Get-Process python

# Restart it
python musicgen_server_mock.py
```

### Want to switch to Supabase function?
The code already has fallback logic. Just make sure:
1. `HUGGINGFACE_API_KEY` is set in Supabase secrets
2. Local server is stopped or unreachable
3. Frontend will automatically use Supabase

---

**You're ready to test your MVP!** 🚀

The mock server is perfect for demonstrating the feature flow, UI, and user experience. You can always add real music generation later.



