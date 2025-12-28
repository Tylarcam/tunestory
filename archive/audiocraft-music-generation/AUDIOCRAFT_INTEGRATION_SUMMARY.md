# AudioCraft MusicGen Integration Summary

## ✅ Completed Implementation

Meta's AudioCraft MusicGen has been successfully integrated into TuneStory as a new "Generate Mode" alongside the existing "Discover Mode".

## 🏗️ Architecture

### Backend Components

1. **`supabase/functions/_shared/audiocraft-prompt.ts`**
   - Shared utility for building AudioCraft-optimized prompts
   - Converts visual analysis (mood, energy, genres, tempo) into musical descriptions
   - Includes prompt engineering best practices for MusicGen

2. **`supabase/functions/generate-music/index.ts`**
   - Edge function that calls Hugging Face Inference API for AudioCraft MusicGen
   - Handles audio generation and returns base64-encoded WAV file
   - Includes error handling for model loading (503) and other API errors

### Frontend Components

1. **`src/components/MusicModeToggle.tsx`**
   - Toggle component for switching between "Discover" and "Generate" modes
   - Styled with gradient backgrounds and icons

2. **`src/components/GeneratedMusicCard.tsx`**
   - Component for displaying AI-generated audio tracks
   - Includes audio player with waveform visualization
   - Download and regenerate functionality
   - Shows generation prompt and metadata

3. **`src/pages/Index.tsx`** (Updated)
   - Added music mode state management
   - Integrated generate mode into existing photo analysis flow
   - Added `handleGenerateMusic` function
   - Updated UI to show MusicModeToggle and GeneratedMusicCard

## 🔄 User Flow

1. User uploads a photo
2. User selects "Discover" or "Generate" mode
3. **Discover Mode**: Analyzes image → Searches Spotify → Returns recommendations
4. **Generate Mode**: Analyzes image → Generates music with AudioCraft → Returns AI-generated track

## 🚀 Deployment Requirements

### Required Environment Variable

Add to Supabase Edge Function secrets:
```
HUGGINGFACE_API_KEY=hf_your_token_here
```

To get a Hugging Face API key:
1. Sign up at https://huggingface.co/
2. Go to https://huggingface.co/settings/tokens
3. Create new token with "read" permission
4. Add to Supabase: Dashboard → Settings → Edge Functions → Secrets

### Deploy Edge Function

```bash
supabase functions deploy generate-music
```

## 📊 Features

- ✅ Dual-mode system (Discover vs Generate)
- ✅ AudioCraft MusicGen integration via Hugging Face API
- ✅ Audio playback with waveform visualization
- ✅ Download generated tracks as WAV files
- ✅ Regenerate functionality
- ✅ Error handling for model loading states
- ✅ Loading states with estimated wait time (20-40 seconds)
- ✅ Prompt engineering for optimal music generation

## 🎵 Generation Parameters

- **Model**: `facebook/musicgen-large` (Meta Research)
- **Duration**: ~10-30 seconds
- **Format**: WAV (uncompressed)
- **Sample Rate**: 32kHz
- **Generation Time**: 
  - First request (cold start): 30-60s
  - Subsequent requests (warm): 15-30s

## 🔧 Technical Details

### Prompt Engineering

The system converts visual analysis into AudioCraft prompts using this format:
```
[genre] [mood] [tempo], [instruments], [energy], high quality production
```

Example: `folk nostalgic warm slow gentle tempo, acoustic guitar, piano, moderate balanced dynamics, high quality production`

### Error Handling

- **503 Status**: Model is loading (retryable)
- **API Errors**: Display user-friendly error messages
- **Timeout Handling**: Graceful degradation

## 📝 Next Steps (Optional Enhancements)

1. Add Supabase Storage integration for persistent audio storage
2. Implement audio caching to avoid regenerating same prompts
3. Add fine-tuning support for custom genres/styles
4. Implement progress tracking for long generation times
5. Add audio effects/processing options

## 🎯 Testing Checklist

- [ ] Set HUGGINGFACE_API_KEY in Supabase secrets
- [ ] Deploy generate-music edge function
- [ ] Upload a photo
- [ ] Switch to Generate mode
- [ ] Click "Generate AI Music"
- [ ] Verify audio plays correctly
- [ ] Test download functionality
- [ ] Test regenerate functionality
- [ ] Verify error handling for model loading

## 📚 Documentation

See `musicGen_Feature.md` for detailed implementation guide and best practices.

