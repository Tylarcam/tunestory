# Testing Mock MusicGen Server - Step by Step

## ✅ Server Status

**Mock server is running and tested!**
- ✅ Health check: Working
- ✅ Generate endpoint: Working
- ✅ Response time: ~1.5 seconds
- ✅ Audio generation: Working (test tones)

## 🚀 Step-by-Step Testing Guide

### Step 1: Start Frontend (if not running)

```bash
npm run dev
# or
bun dev
```

The frontend should start on `http://localhost:5173` (or similar port)

### Step 2: Open Browser

1. Navigate to: `http://localhost:5173`
2. You should see the TuneStory interface

### Step 3: Test the Full Flow

#### 3A. Upload a Photo
1. Click on the photo upload area
2. Select any image file (JPG, PNG, WEBP)
3. Image should appear with preview

#### 3B. Select Generate Mode
1. After uploading, you should see mode selection
2. Click the **"Generate"** button (with sparkles icon)
3. You should see a warning if server is offline (but it's running, so you won't)

#### 3C. Generate Music
1. Click **"Generate AI Music"** button
2. You should see:
   - Loading state: "Generating your AI music... (this may take 30-60 seconds on CPU)"
   - Wait ~1.5 seconds (mock server is fast!)
   - Success message: "Music Generated!"

#### 3D. Play Audio
1. You should see the `GeneratedMusicCard` component
2. Click **"Play"** button
3. You should hear a simple test tone (440 Hz sine wave)
4. Waveform visualization should animate
5. Progress bar should move

#### 3E. Test Other Features
- **Download**: Click download button (saves WAV file)
- **Regenerate**: Click regenerate button (creates new test audio)
- **View Prompt**: Expand "View generation prompt" to see the prompt used

### Step 4: Verify in Browser Console

Open browser DevTools (F12) and check Console tab. You should see:
```
🎵 Calling MusicGen server...
   Prompt: [your prompt here]
✅ Music generated successfully
   Size: [number] bytes
   Time: [number] seconds
```

### Step 5: Test Server Health Check

The frontend automatically checks server health when you switch to Generate mode. You should see:
- No error messages
- Server status indicator (if implemented)
- Generate button is enabled

## 🧪 Manual API Testing

You can also test the API directly:

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"healthy","device":"cpu","model_loaded":true,"mode":"mock"}
```

### Test Generate Endpoint
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"happy electronic music","duration":10,"temperature":1.0,"model_size":"small"}'
```

Expected response:
```json
{
  "success": true,
  "audio_base64": "[base64 encoded audio]",
  "prompt": "happy electronic music",
  "metadata": {
    "model": "facebook/musicgen-small",
    "duration": 10,
    "sample_rate": 32000,
    "size_bytes": 640044,
    "generation_time_seconds": 1.5,
    "framework": "Mock (AudioCraft not installed)",
    "device": "cpu"
  }
}
```

## ✅ What to Verify

- [ ] Frontend loads without errors
- [ ] Photo upload works
- [ ] Mode toggle switches to "Generate"
- [ ] Generate button is clickable
- [ ] Loading state appears during generation
- [ ] Success message appears after generation
- [ ] Audio card displays with controls
- [ ] Play button works and audio plays
- [ ] Download button saves WAV file
- [ ] Regenerate button creates new audio
- [ ] No console errors in browser DevTools
- [ ] Server responds quickly (~1.5 seconds)

## 🐛 Troubleshooting

### Frontend not connecting to server?
- Check server is running: `curl http://localhost:8000/health`
- Check browser console for CORS errors
- Verify server is on port 8000

### Audio not playing?
- Check browser console for errors
- Verify audio URL is a valid data URL
- Try downloading the file to verify it's valid WAV

### Generation fails?
- Check server logs (where you ran `python musicgen_server_mock.py`)
- Check browser console for error messages
- Verify network tab shows successful POST to `/generate`

## 📊 Expected Behavior

**Mock Server Characteristics:**
- ⚡ Fast: ~1.5 seconds (vs 30-60s for real generation)
- 🎵 Audio: Simple 440 Hz sine wave tone (not real music)
- ✅ Format: Valid WAV file, playable in browser
- 📦 Size: ~320KB for 30 seconds of audio

**This is perfect for:**
- UI/UX testing
- Demo videos
- Frontend integration testing
- User flow validation

## 🎬 Next Steps After Testing

Once you've verified everything works:
1. ✅ Record a demo video showing the flow
2. ✅ Test on different browsers
3. ✅ Test on mobile (if responsive)
4. ✅ Consider adding real music generation (Option 2 or 3 from guide)

---

**Ready to test!** Start your frontend and follow the steps above. 🚀



