# Quick Test Guide - Mock Server

## ✅ Current Status

**Mock Server: ✅ RUNNING** on `http://localhost:8000`
- Health check: ✅ Working
- Generate endpoint: ✅ Working  
- Response time: ~1.5 seconds

## 🚀 Start Testing (3 Steps)

### Step 1: Start Frontend
Open a new terminal and run:
```bash
npm run dev
# or if you use bun:
bun dev
```

Wait for it to say: `Local: http://localhost:5173`

### Step 2: Open Browser
Navigate to: **http://localhost:5173**

### Step 3: Test the Flow

1. **Upload Photo**
   - Click the upload area
   - Select any image file
   - Photo should appear

2. **Switch to Generate Mode**
   - After upload, you'll see mode selection
   - Click the **"Generate"** button (with ✨ sparkles icon)

3. **Generate Music**
   - Click **"Generate AI Music"** button
   - Wait ~1.5 seconds (mock server is fast!)
   - You should see: "Music Generated!" message

4. **Play Audio**
   - Click **"Play"** button
   - You'll hear a simple test tone (440 Hz sine wave)
   - Waveform should animate
   - Progress bar should move

5. **Test Other Features**
   - **Download**: Saves WAV file
   - **Regenerate**: Creates new test audio
   - **View Prompt**: Expand to see the prompt

## ✅ What You Should See

- ✅ Fast generation (~1.5 seconds)
- ✅ Success message appears
- ✅ Audio card with controls
- ✅ Play button works
- ✅ Audio plays (simple tone)
- ✅ Download works
- ✅ No errors in browser console

## 🐛 If Something Doesn't Work

**Server not responding?**
```bash
# Check if running
curl http://localhost:8000/health

# Restart if needed
python musicgen_server_mock.py
```

**Frontend not connecting?**
- Check browser console (F12) for errors
- Verify server is on port 8000
- Check CORS errors

**Audio not playing?**
- Check browser console
- Try downloading the file
- Verify it's a valid WAV file

## 📊 Expected Results

**Mock Server Output:**
- ⚡ Speed: ~1.5 seconds
- 🎵 Audio: Simple test tone (not real music)
- 📦 Format: Valid WAV file
- ✅ All UI features work

**Perfect for:**
- ✅ UI/UX testing
- ✅ Demo videos  
- ✅ Frontend integration
- ✅ User flow validation

---

**Ready!** Start your frontend and test! 🚀





