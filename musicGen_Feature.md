# Agentic Prompt: Add AudioCraft Music Generation to TuneStory

## 🎯 Project Goal

Add Meta's **AudioCraft** (specifically MusicGen) as a NEW music generation feature alongside the existing Spotify recommendation system. Users will choose between:

1. **Discover Mode** (Existing): Find existing Spotify tracks that match the photo's vibe
2. **Generate Mode** (NEW): Create original AI-generated music using AudioCraft's MusicGen

This uses Meta's open-source AudioCraft toolkit, demonstrating both API integration AND deep generative AI knowledge.

---

## 📋 Context: What You're Working With

### Existing Application (KEEP AS-IS)

* **Name** : TuneStory
* **Current Function** : Analyzes photos with Gemini Vision → Searches Spotify for matching tracks
* **Tech Stack** :
* Frontend: React 18.3.1, TypeScript 5.8.3, Vite 5.4, Tailwind CSS
* Backend: Supabase Edge Functions (Deno/TypeScript)
* APIs: Gemini 2.5 Flash (via Lovable), Spotify Web API
* **Status** : Working and deployed ✅

### What You're Adding (NEW FEATURE)

* **Framework** : AudioCraft by Meta Research
* **Model** : MusicGen (text-to-music)
* **Deployment Options** :

1. Hugging Face Inference API (easiest, free tier)
2. Replicate API (production-ready, pay-per-use)
3. Local deployment (learning/demo)

* **Status** : **Open source, available now** ✅

---

## 🎵 Why AudioCraft is the Best Choice

### Technical Advantages

1. **Open Source** : Full codebase, can inspect and modify
2. **Multi-Model Suite** : MusicGen (music) + AudioGen (SFX) + EnCodec (compression)
3. **State-of-the-Art** : Meta Research quality, published papers
4. **Flexible Deployment** : API, local, or fine-tuned
5. **Active Development** : Regular updates, strong community
6. **Production Ready** : Used by real apps in production

### For Your Moises Application

1. ✅  **Shows depth** : "I used AudioCraft" > "I called an API"
2. ✅  **Open source credibility** : Can fine-tune, modify, extend
3. ✅  **Meta Research** : Same caliber as MusicLM (Google)
4. ✅  **Multiple deployment paths** : Shows architectural thinking
5. ✅  **Room to grow** : Can add AudioGen for sound effects later
6. ✅  **Better story** : "I chose AudioCraft because..." shows judgment

---

## 🚀 Deployment Strategy (Choose One)

### **Option 1: Hugging Face Inference API** ⭐ RECOMMENDED FOR MVP

 **Best for** : Getting working feature TODAY (2-3 hours)

 **Pros** :

* ✅ Free tier (1000 requests/day)
* ✅ No infrastructure needed
* ✅ 5 minute setup
* ✅ Production-ready

 **Cons** :

* ⚠️ Rate limits on free tier
* ⚠️ 20-40s generation time (cold start)
* ⚠️ Dependent on HF infrastructure

 **Cost** : Free (1000/day), then $0.60/hour for dedicated endpoint

 **Setup Time** : 5 minutes

 **Use this for** : Your Moises demo (working feature ASAP)

---

### **Option 2: Replicate API** ⭐ RECOMMENDED FOR PRODUCTION

 **Best for** : Production deployment after MVP

 **Pros** :

* ✅ Pay-per-use (~$0.05/generation)
* ✅ Fast inference (10-20s)
* ✅ Reliable infrastructure
* ✅ Simple API

 **Cons** :

* ⚠️ Costs money (but minimal)
* ⚠️ Dependent on third party

 **Cost** : ~$0.05 per 30-second track

 **Setup Time** : 10 minutes

 **Use this for** : Production after initial demo works

---

### **Option 3: Local Deployment**

 **Best for** : Learning, fine-tuning, or offline demo

 **Pros** :

* ✅ Complete control
* ✅ No API costs
* ✅ Can fine-tune
* ✅ Learn model internals

 **Cons** :

* ❌ Requires GPU (NVIDIA with CUDA)
* ❌ Complex setup (Docker, dependencies)
* ❌ Not suitable for web deployment
* ❌ 2-5 minute generation time on consumer GPU

 **Requirements** :

* GPU: NVIDIA with 16GB+ VRAM (RTX 3090, 4090, A100)
* RAM: 32GB+
* Storage: 20GB for models

 **Setup Time** : 1-2 hours

 **Use this for** : Learning or if you have local GPU access

---

## 🏗️ Architecture (Same as Before)

### High-Level Flow

```
User uploads photo
    ↓
Gemini Vision analyzes (SHARED - no changes)
    ↓
    ┌─────────────────┴──────────────────┐
    ↓                                    ↓
MODE 1: DISCOVER (Existing)      MODE 2: GENERATE (NEW)
    ↓                                    ↓
Search Spotify tracks            Generate with AudioCraft
    ↓                                    ↓
Return existing music            Return original audio
    ↓                                    ↓
    └─────────────────┬──────────────────┘
                      ↓
            Display in unified UI
```

---

## 💻 Implementation: Hugging Face Inference API (Recommended)

### Step 1: Get Hugging Face API Key (5 minutes)

```bash
# 1. Sign up at https://huggingface.co/
# 2. Go to https://huggingface.co/settings/tokens
# 3. Create new token with "read" permission
# 4. Copy token starting with "hf_..."
```

### Step 2: Add to Supabase Secrets

```bash
# In Supabase Dashboard:
# Settings → Edge Functions → Secrets → Add Secret

Name: HUGGINGFACE_API_KEY
Value: hf_your_token_here
```

### Step 3: Create Edge Function

 **Location** : `supabase/functions/generate-music/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { buildMusicGenPrompt } from '../_shared/audiocraft-prompt.ts'

// AudioCraft MusicGen via Hugging Face
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/musicgen-large'

serve(async (req) => {
  try {
    const { 
      mood, 
      energy, 
      genres, 
      tempo_bpm, 
      description, 
      setting,
      time_of_day,
      visualElements 
    } = await req.json()
  
    // Build AudioCraft-optimized prompt
    const musicPrompt = buildMusicGenPrompt({
      mood,
      energy,
      genres,
      tempo_bpm,
      description,
      setting,
      time_of_day,
      visualElements
    })
  
    console.log('🎵 AudioCraft prompt:', musicPrompt)
  
    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY')
  
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY not configured')
    }
  
    // Call AudioCraft MusicGen via Hugging Face
    console.log('🎵 Calling AudioCraft MusicGen...')
  
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: musicPrompt,
        parameters: {
          // MusicGen-specific parameters
          max_new_tokens: 256,     // ~10-30 seconds of audio
          do_sample: true,
          temperature: 1.0,        // Control randomness (0.0-2.0)
          top_k: 250,
          top_p: 0.0,
          guidance_scale: 3.0      // How closely to follow prompt
        },
        options: {
          wait_for_model: true,    // Wait if model is loading (20-40s)
          use_cache: false         // Fresh generation each time
        }
      })
    })
  
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ AudioCraft API error:', response.status, errorText)
    
      // Handle common errors
      if (response.status === 503) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Model is loading. Please try again in 20-30 seconds.',
            retryable: true
          }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    
      throw new Error(`AudioCraft API error: ${response.status} - ${errorText}`)
    }
  
    // Response is audio binary (WAV format)
    const audioBlob = await response.blob()
    const audioBuffer = await audioBlob.arrayBuffer()
  
    console.log('✅ Generated audio:', audioBuffer.byteLength, 'bytes')
  
    // Convert to base64 for data URL
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    )
  
    const audioDataUrl = `data:audio/wav;base64,${base64Audio}`
  
    // Optional: Upload to Supabase Storage for persistence
    // const storageUrl = await uploadToStorage(audioBuffer, musicPrompt)
  
    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: audioDataUrl, // or storageUrl if using storage
        prompt: musicPrompt,
        metadata: {
          model: 'AudioCraft MusicGen Large (Meta Research)',
          version: 'facebook/musicgen-large',
          duration: 30, // approximate
          status: 'generated',
          format: 'wav',
          size: audioBuffer.byteLength,
          framework: 'AudioCraft'
        }
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        } 
      }
    )
  
  } catch (error) {
    console.error('❌ Error generating music:', error)
  
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack,
        retryable: false
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### Step 4: Prompt Engineering for AudioCraft

 **Location** : `supabase/functions/_shared/audiocraft-prompt.ts`

```typescript
interface VisualAnalysis {
  mood: string
  energy: number
  genres: string[]
  tempo_bpm: number
  description: string
  setting: string
  time_of_day: string
  visualElements: {
    colors: string[]
    instruments?: string[]
  }
}

export function buildMusicGenPrompt(analysis: VisualAnalysis): string {
  const {
    mood,
    energy,
    genres,
    tempo_bpm,
    visualElements
  } = analysis
  
  // AudioCraft MusicGen prompt engineering best practices:
  // 1. Keep it simple and descriptive (10-25 words)
  // 2. Focus on musical attributes (genre, tempo, instruments, mood)
  // 3. Use concrete terms, not abstract concepts
  // 4. Specify quality ("high quality", "professional")
  // 5. AudioCraft understands musical terminology well
  
  const genre = genres[0] || 'instrumental'
  const moodDesc = getMoodDescriptor(mood)
  const tempoDesc = getTempoDescriptor(tempo_bpm)
  const energyDesc = getEnergyDescriptor(energy)
  
  // Get instruments from visual analysis or defaults
  const instruments = visualElements.instruments?.length 
    ? visualElements.instruments.slice(0, 3).join(', ')
    : getDefaultInstruments(genre)
  
  // Build concise, musical prompt
  // Format: [genre] [mood] [tempo], [instruments], [energy], [quality]
  const prompt = `${genre} ${moodDesc} ${tempoDesc}, ${instruments}, ${energyDesc}, high quality production`
  
  return prompt
}

// Mood → Musical descriptors
function getMoodDescriptor(mood: string): string {
  const descriptors: Record<string, string> = {
    joyful: 'uplifting cheerful',
    melancholic: 'melancholic contemplative',
    energetic: 'energetic vibrant',
    calm: 'calm peaceful',
    nostalgic: 'nostalgic warm',
    triumphant: 'triumphant epic',
    romantic: 'romantic tender',
    adventurous: 'adventurous exciting',
    mysterious: 'mysterious atmospheric',
    dramatic: 'dramatic cinematic'
  }
  
  return descriptors[mood] || mood
}

// BPM → Tempo descriptor
function getTempoDescriptor(bpm: number): string {
  if (bpm < 70) return 'very slow ballad'
  if (bpm < 90) return 'slow gentle tempo'
  if (bpm < 110) return 'medium relaxed tempo'
  if (bpm < 130) return 'moderate upbeat tempo'
  if (bpm < 150) return 'fast energetic tempo'
  return 'very fast intense tempo'
}

// Energy → Dynamic descriptor
function getEnergyDescriptor(energy: number): string {
  if (energy <= 2) return 'very soft gentle dynamics'
  if (energy <= 4) return 'soft mellow dynamics'
  if (energy <= 6) return 'moderate balanced dynamics'
  if (energy <= 8) return 'powerful driving dynamics'
  return 'very intense explosive dynamics'
}

// Genre → Default instrumentation
function getDefaultInstruments(genre: string): string {
  const instruments: Record<string, string> = {
    folk: 'acoustic guitar, light percussion',
    electronic: 'synthesizers, electronic drums, bass',
    ambient: 'soft pads, atmospheric textures',
    classical: 'piano, strings, orchestral',
    pop: 'guitar, bass, drums, synth',
    'hip-hop': 'bass, drums, samples',
    jazz: 'piano, saxophone, double bass',
    rock: 'electric guitar, drums, bass guitar',
    metal: 'distorted guitar, heavy drums',
    country: 'acoustic guitar, fiddle, banjo',
    blues: 'guitar, harmonica, bass',
    reggae: 'guitar, bass, offbeat rhythm',
    latin: 'percussion, guitar, brass',
    indie: 'guitar, synth, drums'
  }
  
  return instruments[genre] || 'mixed instrumentation'
}

// Export for testing
export const testPromptBuilder = {
  getMoodDescriptor,
  getTempoDescriptor,
  getEnergyDescriptor,
  getDefaultInstruments
}
```

### Example Prompt Transformations

```typescript
// Example 1: Beach Sunset
Input: {
  mood: "nostalgic",
  energy: 5,
  genres: ["folk"],
  tempo_bpm: 88,
  visualElements: { instruments: ["acoustic guitar", "piano"] }
}

Output: 
"folk nostalgic warm slow gentle tempo, acoustic guitar, piano, moderate balanced dynamics, high quality production"

// Example 2: City Night
Input: {
  mood: "energetic",
  energy: 8,
  genres: ["electronic"],
  tempo_bpm: 128,
  visualElements: { instruments: [] }
}

Output:
"electronic energetic vibrant moderate upbeat tempo, synthesizers, electronic drums, bass, powerful driving dynamics, high quality production"

// Example 3: Forest Morning
Input: {
  mood: "calm",
  energy: 3,
  genres: ["ambient"],
  tempo_bpm: 65,
  visualElements: { instruments: ["piano", "soft pads"] }
}

Output:
"ambient calm peaceful very slow ballad, piano, soft pads, soft mellow dynamics, high quality production"
```

---

## 🎨 Frontend Components (Reuse from Previous Prompts)

### 1. VibeModeToggle

 **Location** : `src/components/VibeModeToggle.tsx`

```typescript
import { Search, Sparkles } from 'lucide-react'

interface VibeModeToggleProps {
  mode: 'discover' | 'generate'
  onModeChange: (mode: 'discover' | 'generate') => void
  disabled?: boolean
}

export function VibeModeToggle({ mode, onModeChange, disabled }: VibeModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-card/60 backdrop-blur-xl rounded-full p-1 border border-border/50">
      <button
        onClick={() => onModeChange('discover')}
        disabled={disabled}
        className={`
          px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2
          ${mode === 'discover' 
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
            : 'text-muted-foreground hover:text-foreground'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Search className="w-4 h-4" />
        <span className="font-medium">Discover</span>
      </button>
    
      <button
        onClick={() => onModeChange('generate')}
        disabled={disabled}
        className={`
          px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2
          ${mode === 'generate' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
            : 'text-muted-foreground hover:text-foreground'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">Generate</span>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
          AI
        </span>
      </button>
    </div>
  )
}
```

### 2. GeneratedMusicCard

 **Location** : `src/components/GeneratedMusicCard.tsx`

```typescript
import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download, RefreshCw, Info, Sparkles } from 'lucide-react'

interface GeneratedMusicCardProps {
  audioUrl: string
  prompt: string
  metadata: {
    model: string
    duration: number
    status: string
    framework?: string
  }
  onRegenerate?: () => void
}

export function GeneratedMusicCard({ 
  audioUrl, 
  prompt, 
  metadata,
  onRegenerate 
}: GeneratedMusicCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
  
    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
  
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
  
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])
  
  const togglePlay = () => {
    if (!audioRef.current) return
  
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }
  
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `tunestory-audiocraft-${Date.now()}.wav`
    a.click()
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-lg">AI-Generated Track</h3>
        </div>
        <div className="text-xs text-muted-foreground bg-amber-500/10 px-3 py-1 rounded-full">
          AudioCraft
        </div>
      </div>
    
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    
      {/* Waveform Visualization */}
      <div className="h-24 bg-black/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
        <div className="flex items-center gap-0.5 h-full px-2">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-gradient-to-t from-amber-500 to-orange-500 rounded-full transition-all duration-100 ${
                isPlaying ? 'animate-pulse' : ''
              }`}
              style={{ 
                height: `${20 + Math.random() * 70}%`,
                animationDelay: `${i * 0.03}s`,
                opacity: currentTime / duration > i / 40 ? 1 : 0.3
              }}
            />
          ))}
        </div>
      
        {/* Time Display */}
        <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/40 px-2 py-1 rounded">
          {formatTime(currentTime)} / {formatTime(duration || metadata.duration)}
        </div>
      </div>
    
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100"
          style={{ width: `${(currentTime / (duration || metadata.duration)) * 100}%` }}
        />
      </div>
    
      {/* Controls */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={togglePlay}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Play
            </>
          )}
        </button>
      
        <button
          onClick={handleDownload}
          className="bg-card hover:bg-card/80 p-3 rounded-xl transition-all border border-border/50"
          title="Download WAV"
        >
          <Download className="w-5 h-5" />
        </button>
      
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="bg-card hover:bg-card/80 p-3 rounded-xl transition-all border border-border/50"
            title="Regenerate"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>
    
      {/* Metadata */}
      <div className="text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>Generated with {metadata.model}</span>
        </div>
      
        <details className="cursor-pointer">
          <summary className="hover:text-foreground transition-colors select-none">
            View generation prompt →
          </summary>
          <p className="mt-2 p-3 bg-black/20 rounded-lg text-foreground/80 text-sm leading-relaxed">
            "{prompt}"
          </p>
        </details>
      </div>
    </div>
  )
}
```

### 3. Update Index.tsx

 **Add to your main page** :

```typescript
// Add imports
import { VibeModeToggle } from '@/components/VibeModeToggle'
import { GeneratedMusicCard } from '@/components/GeneratedMusicCard'

// Add state
const [vibeMode, setVibeMode] = useState<'discover' | 'generate'>('discover')
const [generatedTrack, setGeneratedTrack] = useState<any>(null)
const [isGenerating, setIsGenerating] = useState(false)

// Add generation handler
const handleGenerateMusic = async (analysis: any) => {
  setIsGenerating(true)
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-music', {
      body: {
        mood: analysis.mood,
        energy: analysis.energy,
        genres: analysis.genres,
        tempo_bpm: analysis.tempo_bpm,
        description: analysis.description,
        setting: analysis.setting,
        time_of_day: analysis.time_of_day,
        visualElements: analysis.visualElements
      }
    })
  
    if (error) {
      // Handle retryable errors (503 - model loading)
      if (error.status === 503) {
        toast.error('Model is loading. Please try again in 20 seconds.')
        return
      }
      throw error
    }
  
    if (!data.success) {
      throw new Error(data.error)
    }
  
    setGeneratedTrack(data)
    toast.success('Music generated successfully!')
  
  } catch (error) {
    console.error('Generation error:', error)
    toast.error('Failed to generate music. Please try again.')
  } finally {
    setIsGenerating(false)
  }
}

// Update your analysis handler
const handleImageAnalysis = async (imageData: string) => {
  // ... existing analysis code ...
  
  if (vibeMode === 'discover') {
    // Existing Spotify flow
    await fetchSpotifyRecommendations(analysis)
  } else if (vibeMode === 'generate') {
    // New AudioCraft flow
    await handleGenerateMusic(analysis)
  }
}

// In your render:
<VibeModeToggle
  mode={vibeMode}
  onModeChange={(newMode) => {
    setVibeMode(newMode)
    // Optionally fetch results for new mode if analysis exists
  }}
  disabled={isLoading || isGenerating}
/>

{/* ... photo upload ... */}

{vibeMode === 'generate' && generatedTrack && (
  <GeneratedMusicCard
    audioUrl={generatedTrack.audioUrl}
    prompt={generatedTrack.prompt}
    metadata={generatedTrack.metadata}
    onRegenerate={() => handleGenerateMusic(moodAnalysis)}
  />
)}
```

---

## ⚡ Quick Start (Get Working in 1 Hour)

### Phase 1: Backend Setup (20 minutes)

```bash
# 1. Get HF API key (5 min)
# https://huggingface.co/settings/tokens

# 2. Add to Supabase secrets (2 min)
# Dashboard → Settings → Edge Functions → Secrets
# HUGGINGFACE_API_KEY=hf_...

# 3. Create edge function files (5 min)
mkdir -p supabase/functions/generate-music
mkdir -p supabase/functions/_shared

# Copy edge function code (from above)
# supabase/functions/generate-music/index.ts
# supabase/functions/_shared/audiocraft-prompt.ts

# 4. Deploy (3 min)
supabase functions deploy generate-music

# 5. Test with curl (5 min)
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-music' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mood":"joyful","energy":7,"genres":["pop"],"tempo_bpm":120,"description":"happy","setting":"party","time_of_day":"evening","visualElements":{"colors":[],"instruments":[]}}'
```

### Phase 2: Frontend Integration (30 minutes)

```bash
# 1. Create components (20 min)
# src/components/VibeModeToggle.tsx
# src/components/GeneratedMusicCard.tsx

# 2. Update Index.tsx (10 min)
# Add state, handlers, render logic
```

### Phase 3: Test & Polish (10 minutes)

```bash
# 1. Upload photo
# 2. Switch to Generate mode
# 3. Wait 20-40s for generation
# 4. Play audio
# 5. Test download
# 6. Test regenerate
```

**Total: ~1 hour to working feature** ✅

---

## 📊 AudioCraft Performance Expectations

### Generation Times

| Scenario                   | Time   | Notes                      |
| -------------------------- | ------ | -------------------------- |
| First request (cold start) | 30-60s | Model loading + generation |
| Subsequent requests (warm) | 15-30s | Just generation            |
| With dedicated endpoint    | 10-20s | Always warm                |

### Audio Quality

* **Sample rate** : 32kHz (good quality)
* **Format** : WAV (uncompressed)
* **Duration** : ~10-30 seconds (configurable)
* **File size** : ~1-3MB for 30s

### API Limits (Hugging Face Free Tier)

* **Daily requests** : 1000 calls/day
* **Concurrent** : 1 at a time
* **Rate limit** : No strict limit on free tier
* **Model loading** : ~20-30s if cold

---

## 🎯 For Your Moises Application

### Your Narrative

> "I built TuneStory with a dual-mode approach to music AI:
>
> **Discover Mode** uses traditional API orchestration - searching Spotify's catalog via their Web API.
>
> **Generate Mode** uses **Meta's AudioCraft** - specifically the MusicGen model - to synthesize original 30-second compositions from photos.
>
> I chose AudioCraft over alternatives because:
>
> 1. It's **open source** - I can inspect, modify, and potentially fine-tune
> 2. It's **Meta Research** - same caliber as Google's MusicLM
> 3. It's **production-ready** - used by real applications today
> 4. It offers **multiple deployment paths** - API for MVP, local for learning, fine-tuning for specialization
>
> The technical challenge was engineering the prompt translation layer. AudioCraft's MusicGen performs best with simple, musical descriptions. A sunset beach photo becomes: 'folk nostalgic warm slow gentle tempo, acoustic guitar, piano, moderate balanced dynamics, high quality production.'
>
> The system is **deployed and working** via Hugging Face Inference API. Users can compare curated discovery versus generative synthesis - two fundamentally different approaches to the same problem."

### What This Demonstrates

✅ **Generative AI expertise** - Actual audio synthesis

✅ **Open source credibility** - AudioCraft, not black-box API

✅ **Meta Research** - Credible source (same as MusicLM)

✅ **Architectural thinking** - Multiple deployment options

✅ **Production skills** - Deployed and working today

✅ **Prompt engineering** - Visual → musical translation

✅ **Product judgment** - Chose AudioCraft for good reasons

✅ **Room to grow** - Can fine-tune, add AudioGen (SFX)

---

## 📝 Updated Resume Bullets

```
TuneStory - Conditional Music Generation Platform

• Built dual-mode music platform demonstrating two approaches to music AI: 
  traditional search (Spotify API) and generative synthesis (Meta's AudioCraft)

• Implemented conditional audio generation using AudioCraft's MusicGen transformer 
  model via Hugging Face Inference API, synthesizing original 30-second compositions 
  from visual mood analysis

• Engineered prompt optimization system translating image features (mood, energy, 
  setting, BPM) to musical descriptions optimized for AudioCraft's architecture, 
  achieving coherent musical outputs

• Architected serverless edge functions on Supabase handling both REST API 
  orchestration and ML model inference, with audio processing, error handling, 
  and retry logic for production reliability

• Built production TypeScript/React frontend with dual-mode state management, 
  real-time audio playback, progress visualization, and download functionality

• Tech: AudioCraft (Meta), MusicGen, Hugging Face API, Gemini Vision, 
  React/TypeScript, Supabase, Web Audio API

Key Learning: Chose AudioCraft over alternatives for its open-source nature, 
enabling future fine-tuning and model inspection. MusicGen requires concise 
musical prompts (10-25 words) rather than narrative descriptions, demonstrating 
different engineering patterns than text models
```

---

## ✅ Definition of Done

### Functional Requirements

* [ ] Mode toggle switches between Discover and Generate
* [ ] Generate mode calls AudioCraft and returns audio
* [ ] Audio plays in browser
* [ ] Download saves WAV file
* [ ] Regenerate creates new variations
* [ ] Loading states during 20-40s generation
* [ ] Error handling for model loading, timeouts, failures
* [ ] Both modes work independently

### Technical Requirements

* [ ] Edge function deploys successfully
* [ ] Hugging Face API integration works
* [ ] Prompt engineering produces quality results
* [ ] TypeScript types complete
* [ ] No console errors or warnings
* [ ] Mobile responsive

### Documentation

* [ ] README updated with AudioCraft feature
* [ ] Code comments explain prompt engineering
* [ ] Architecture documented
* [ ] Demo video recorded (2-3 min)

---

## 🚀 Advanced: Fine-Tuning AudioCraft (Future Enhancement)

Once you have the basic feature working, you could demonstrate deeper ML knowledge by fine-tuning:

```python
# Example fine-tuning script (local, requires GPU)
from audiocraft.models import MusicGen

# Load pretrained model
model = MusicGen.get_pretrained('facebook/musicgen-large')

# Fine-tune on custom dataset (e.g., specific genre)
# This shows advanced ML understanding
model.train(
    dataset_path='./my_music_dataset',
    epochs=10,
    learning_rate=1e-5
)

# Save fine-tuned model
model.save('musicgen-tunestory-finetuned')
```

This would be an impressive addition for your Moises application.

---

## 📞 Ready to Build!

You now have:

✅ Complete implementation guide for AudioCraft

✅ Hugging Face Inference API integration

✅ Prompt engineering best practices

✅ Frontend components with audio playback

✅ Updated resume bullets

✅ Strong narrative for Moises

**Start with the backend edge function** - that's the core value. Once that works, the frontend is just UI polish.

**Want help with:**

* [ ] Testing the Hugging Face API?
* [ ] Debugging edge function issues?
* [ ] Creating prompt engineering examples?
* [ ] Recording demo video?
* [ ] Writing cover letter?

Let's ship this! 🚀🎵
