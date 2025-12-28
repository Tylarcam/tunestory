# AudioCraft + Modal Architecture Blueprint
## Technical Analysis & Fast-Build Implementation Guide

**Version**: 1.0  
**Last Updated**: Based on working implementation  
**Target**: Rapid deployment of open-source ML tools on Modal Cloud

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Flow Diagram](#system-flow-diagram)
3. [Implementation Breakdown](#implementation-breakdown)
4. [Fast-Build Instructions](#fast-build-instructions)
5. [Optimizations & Best Practices](#optimizations--best-practices)
6. [Quick Reference](#quick-reference)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER FRONTEND                              │
│  (React/TypeScript) - Photo Upload → Music Generation UI            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTP POST
                                 │ /functions/v1/generate-music
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTION                           │
│  (Deno) - Request validation → Prompt engineering → Modal proxy     │
│  Location: supabase/functions/generate-music/index.ts               │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTP POST
                                 │ AudioCraft-optimized prompt
                                 │ Duration, Temperature params
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MODAL CLOUD PLATFORM                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Container: Debian Slim + Python 3.11                        │  │
│  │  GPU: T4/A10G (configurable)                                 │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  MusicGenModel Class (@app.cls)                        │  │  │
│  │  │  ├─ @enter() load_model() - Loads once per container   │  │  │
│  │  │  └─ @modal.method() generate() - Reusable inference    │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  FastAPI HTTP Endpoint (@app.function + @modal.asgi)  │  │  │
│  │  │  - Validates input                                      │  │  │
│  │  │  - Calls MusicGenModel.generate.remote()                │  │  │
│  │  │  - Returns base64-encoded WAV                           │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ PyTorch + AudioCraft
                                 │ Model: facebook/musicgen-small
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AUDIOCRAFT MUSICGEN MODEL                        │
│  Meta's MusicGen - Text-to-Music Generation                         │
│  Input: Text prompt                                                 │
│  Output: 32kHz WAV audio tensor                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. **Frontend Layer** (React/TypeScript)
- **File**: `src/services/musicgen.ts`
- **Responsibilities**: API calls, audio playback, fallback logic
- **Pattern**: Client-side prompt building, local server fallback

#### 2. **Edge Proxy Layer** (Supabase Edge Functions)
- **File**: `supabase/functions/generate-music/index.ts`
- **Responsibilities**: 
  - Request validation (Zod schema)
  - Prompt engineering (visual analysis → AudioCraft prompt)
  - Modal API proxying
  - Error handling & retry logic
- **Pattern**: Stateless edge function, environment-based routing

#### 3. **Prompt Engineering** (Shared utility)
- **File**: `supabase/functions/_shared/audiocraft-prompt.ts`
- **Responsibilities**: Convert structured analysis to AudioCraft-optimized prompts
- **Pattern**: Multi-factor prompt composition (mood, energy, genre, style, vocals)

#### 4. **Modal Function** (Python/Modal)
- **File**: `modal_musicgen.py`
- **Responsibilities**: 
  - Container image definition
  - Model loading & caching
  - Inference execution
  - FastAPI endpoint exposure
- **Pattern**: Class-based lifecycle with `@enter()` for initialization

#### 5. **ML Inference Layer** (AudioCraft)
- **Framework**: PyTorch + AudioCraft
- **Model**: `facebook/musicgen-small` (300M params)
- **Output**: WAV audio tensor (32kHz sample rate)

---

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMPLETE SYSTEM FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

[USER ACTION]
    │
    ├─> Upload Photo
    │       │
    │       ▼
    │   [Image Analysis] ──> Extract: mood, energy, genres, tempo, visual elements
    │       │
    │       ▼
    │   [Frontend] ──> Build request: { mood, energy, genres, ... }
    │       │
    │       ▼
    │   POST /functions/v1/generate-music
    │
    ▼
[SUPABASE EDGE FUNCTION] ───────────────────────────────────────────────────┐
    │                                                                        │
    ├─> Validate Request (Zod schema)                                       │
    │       │                                                                │
    │       ├─> Validate: mood, energy, genres, tempo_bpm, etc.             │
    │       └─> Return 400 if invalid                                        │
    │                                                                        │
    ├─> Build AudioCraft Prompt ───────────────────────────────────────┐    │
    │       │                                                           │    │
    │       ├─> Input: { mood, energy, genres, tempo, style, vocals } │    │
    │       ├─> Transform:                                             │    │
    │       │     ├─> mood → "uplifting cheerful"                     │    │
    │       │     ├─> tempo → "moderate upbeat tempo"                 │    │
    │       │     ├─> energy → "moderate balanced dynamics"           │    │
    │       │     ├─> genres → "electronic"                           │    │
    │       │     ├─> styleLevel → "modern cinematic, pristine..."    │    │
    │       │     └─> vocals → "instrumental, no vocals"              │    │
    │       │                                                           │    │
    │       └─> Output: "modern electronic, uplifting cheerful,        │    │
    │                   moderate upbeat tempo, with synthesizers,      │    │
    │                   electronic drums, bass, pristine clarity with  │    │
    │                   professional mastering, instrumental, no       │    │
    │                   vocals, moderate balanced dynamics, high       │    │
    │                   quality production"                            │    │
    │                                                                        │
    ├─> Call Modal API ─────────────────────────────────────────────────┐    │
    │       │                                                           │    │
    │       ├─> URL: MODAL_API_URL (from env)                          │    │
    │       ├─> Method: POST                                           │    │
    │       ├─> Body: {                                               │    │
    │       │     prompt: "...",                                      │    │
    │       │     duration: 30,                                       │    │
    │       │     temperature: 1.0                                    │    │
    │       │   }                                                      │    │
    │       │                                                           │    │
    │       └─> Error Handling:                                        │    │
    │             ├─> 503 → Retryable, model loading                   │    │
    │             ├─> 429 → Rate limited, retryable                    │    │
    │             ├─> 400 → Invalid request, non-retryable             │    │
    │             └─> 500 → Server error, retryable                    │    │
    │                                                                        │
    └─> Response Transformation ────────────────────────────────────────────┘
            │
            ├─> Parse Modal JSON: { success, audio_base64, ... }
            ├─> Convert: base64 → data:audio/wav;base64,{base64}
            └─> Return: { success, audioUrl, prompt, metadata }

    ▼
[MODAL CLOUD PLATFORM] ──────────────────────────────────────────────────────┐
    │                                                                        │
    ├─> Request Routing ──────────────────────────────────────────────┐     │
    │       │                                                          │     │
    │       ├─> Check if container exists & warm                      │     │
    │       ├─> If cold: Spin up container (~5-10s)                   │     │
    │       └─> Route to FastAPI endpoint                             │     │
    │                                                                  │     │
    ├─> FastAPI Handler ──────────────────────────────────────────────┐     │
    │       │                                                          │     │
    │       ├─> Parse Request: { prompt, duration, temperature }      │     │
    │       ├─> Validate:                                             │     │
    │       │     ├─> prompt: non-empty, max length                   │     │
    │       │     ├─> duration: 1-30 seconds                          │     │
    │       │     └─> temperature: 0.1-2.0                            │     │
    │       │                                                          │     │
    │       └─> Call: musicgen_model.generate.remote(...)             │     │
    │                                                                  │     │
    └─> MusicGenModel.generate() ─────────────────────────────────────┘     │
            │                                                                │
            ├─> [First Request] Container Initialization ────────────┐      │
            │       │                                                 │      │
            │       ├─> @enter() load_model() called                 │      │
            │       ├─> Load AudioCraft dependencies                 │      │
            │       ├─> Download model: facebook/musicgen-small      │      │
            │       │   (~1.5GB, cached after first load)            │      │
            │       ├─> Initialize PyTorch model                     │      │
            │       └─> Move to GPU (T4/A10G)                        │      │
            │                                                         │      │
            ├─> [Every Request] Generation ──────────────────────────┐      │
            │       │                                                 │      │
            │       ├─> Set generation params:                       │      │
            │       │     duration=duration,                         │      │
            │       │     temperature=temperature                    │      │
            │       │                                                 │      │
            │       ├─> model.generate([prompt])                     │      │
            │       │     └─> PyTorch inference on GPU               │      │
            │       │         (~5-15s for 30s audio)                 │      │
            │       │                                                 │      │
            │       ├─> Extract audio tensor: wav[0].cpu()           │      │
            │       │     Shape: [1, sample_rate * duration]         │      │
            │       │     Sample rate: 32000 Hz                      │      │
            │       │                                                 │      │
            │       ├─> Convert to WAV bytes:                        │      │
            │       │     torchaudio.save(buffer, tensor, sr, "wav") │      │
            │       │                                                 │      │
            │       ├─> Encode to base64:                            │      │
            │       │     base64.b64encode(wav_bytes).decode()       │      │
            │       │                                                 │      │
            │       └─> Return: {                                    │      │
            │             success: true,                              │      │
            │             audio_base64: "...",                        │      │
            │             prompt: "...",                              │      │
            │             duration: 30,                               │      │
            │             sample_rate: 32000,                         │      │
            │             size_bytes: 1234567,                        │      │
            │             generation_time_seconds: 8.5,               │      │
            │             format: "wav"                               │      │
            │           }                                             │      │
            │                                                         │      │
            └─> [Container Warmup] ───────────────────────────────────┘      │
                    │                                                        │
                    ├─> Keep container alive for 300s (5 min)               │
                    └─> Subsequent requests reuse same container            │

    ▼
[RESPONSE PATH] ──────────────────────────────────────────────────────────────┐
    │                                                                         │
    ├─> Modal → Supabase Edge Function                                       │
    ├─> Edge Function → Frontend                                             │
    ├─> Frontend: Decode base64 → Audio element                              │
    └─> User: Play/download generated music                                  │

└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Breakdown

### Step-by-Step: How AudioCraft Was Integrated into Modal

#### **Step 1: Container Image Definition**

**Location**: `modal_musicgen.py` lines 25-52

**What Happens**:
1. Base image: `debian_slim` with Python 3.11
2. Install system dependencies (FFmpeg, PyAV requirements)
3. Install PyTorch ecosystem (torch, torchaudio, transformers)
4. Install AudioCraft from GitHub (pinned to v1.3.0)
5. Install API framework (FastAPI, Pydantic)

**Key Decisions**:
- **Debian Slim**: Smaller image size, faster cold starts
- **Python 3.11**: Latest stable, good PyTorch support
- **Pinned Versions**: Prevents dependency conflicts
  - `torch==2.1.0` + `torchaudio==2.1.0` (must match)
  - `transformers==4.35.2` (last version compatible with torch 2.1.0)
  - `audiocraft@v1.3.0` (stable release)
- **FFmpeg Libraries**: Required by PyAV (AudioCraft dependency)

**Code Pattern**:
```python
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "ffmpeg", "pkg-config", ...)
    .pip_install("torch==2.1.0", "torchaudio==2.1.0", ...)
    .pip_install("git+https://github.com/facebookresearch/audiocraft.git@v1.3.0")
)
```

---

#### **Step 2: Model Container Class**

**Location**: `modal_musicgen.py` lines 58-146

**What Happens**:
1. Define `@app.cls` decorator with GPU configuration
2. Implement `@enter()` method for model loading (runs once per container)
3. Implement `@modal.method()` for inference (reusable)

**Key Decisions**:
- **Class-based Pattern**: Maintains model state across requests
- **`@enter()` Decorator**: Runs once when container starts, loads model into memory
- **GPU Configuration**: `gpu="T4"` (cost-effective), `gpu="A10G"` (faster)
- **Warmup Window**: `scaledown_window=300` keeps container alive for 5 minutes
- **Timeout**: `timeout=120` allows 2 minutes per request

**Code Pattern**:
```python
@app.cls(gpu="T4", scaledown_window=300, timeout=120)
class MusicGenModel:
    @enter()
    def load_model(self):
        from audiocraft.models import MusicGen
        self.model = MusicGen.get_pretrained('facebook/musicgen-small')
    
    @modal.method()
    def generate(self, prompt: str, duration: int, temperature: float):
        self.model.set_generation_params(duration=duration, temperature=temperature)
        with torch.no_grad():
            wav = self.model.generate([prompt])
        # ... convert to base64 ...
        return {"success": True, "audio_base64": ...}
```

**Why This Pattern**:
- Model loading takes 10-30s (downloads ~1.5GB on first request)
- Keeping model in memory avoids reload overhead
- Class instance persists across requests within container lifetime
- GPU memory is shared efficiently

---

#### **Step 3: FastAPI HTTP Endpoint**

**Location**: `modal_musicgen.py` lines 153-224

**What Happens**:
1. Create FastAPI app with `@app.function()` and `@modal.asgi_app()`
2. Define request/response models (Pydantic)
3. Implement POST endpoint with validation
4. Call model's `generate.remote()` method
5. Return JSON with base64 audio

**Key Decisions**:
- **FastAPI**: Modern async framework, automatic OpenAPI docs
- **Pydantic Models**: Type validation, automatic error messages
- **Remote Method Call**: `musicgen_model.generate.remote()` executes on GPU container
- **Error Handling**: HTTP status codes (400, 500, 503)
- **Base64 Encoding**: JSON-friendly audio transport

**Code Pattern**:
```python
@app.function()
@modal.asgi_app()
def fastapi_app():
    web_app = FastAPI()
    
    @web_app.post("/")
    async def generate_music(request: MusicRequest):
        # Validate
        if not request.prompt.strip():
            raise HTTPException(400, "Prompt required")
        
        # Call model (executes on GPU container)
        result = musicgen_model.generate.remote(
            prompt=request.prompt,
            duration=request.duration,
            temperature=request.temperature
        )
        
        return JSONResponse(content=result)
    
    return web_app
```

---

#### **Step 4: Supabase Edge Function Integration**

**Location**: `supabase/functions/generate-music/index.ts`

**What Happens**:
1. Receive structured request from frontend (mood, energy, genres, etc.)
2. Validate with Zod schema
3. Transform to AudioCraft prompt via `buildMusicGenPrompt()`
4. Call Modal API with prompt
5. Transform Modal response to frontend format

**Key Decisions**:
- **Zod Validation**: Type-safe request validation, prevents bad inputs
- **Prompt Engineering**: Structured data → optimized AudioCraft prompt
- **Environment-based Routing**: `MODAL_API_URL` from Supabase secrets
- **Error Propagation**: Modal errors → user-friendly messages
- **Response Transformation**: base64 → data URL for frontend

**Code Pattern**:
```typescript
const requestSchema = z.object({
  mood: z.string(),
  energy: z.number(),
  genres: z.array(z.string()),
  // ... more fields
});

const musicPrompt = buildMusicGenPrompt({
  mood, energy, genres, tempo_bpm, ...
});

const modalResponse = await fetch(MODAL_API_URL, {
  method: 'POST',
  body: JSON.stringify({
    prompt: musicPrompt,
    duration: 30,
    temperature: 1.0
  })
});

const audioDataUrl = `data:audio/wav;base64,${modalData.audio_base64}`;
return { success: true, audioUrl: audioDataUrl, ... };
```

---

#### **Step 5: Prompt Engineering Layer**

**Location**: `supabase/functions/_shared/audiocraft-prompt.ts`

**What Happens**:
1. Transform mood → musical descriptors ("joyful" → "uplifting cheerful")
2. Transform energy → dynamics ("8" → "powerful driving dynamics")
3. Transform tempo → tempo descriptors (120 BPM → "moderate upbeat tempo")
4. Add style level → era + production quality (0-10 scale)
5. Add vocal type → vocal descriptors
6. Compose final prompt with genre, instruments, quality markers

**Key Decisions**:
- **Multi-factor Composition**: Combines 7+ factors into single prompt
- **AudioCraft Best Practices**: 
  - 10-25 words optimal
  - Musical terminology preferred
  - Quality markers ("high quality production")
- **Fallback Logic**: Default instruments per genre if not specified
- **Style Mapping**: 0-10 scale → era (1980s/1990s/modern) + production style

**Example Transformation**:
```
Input:
{
  mood: "joyful",
  energy: 8,
  genres: ["electronic"],
  tempo_bpm: 120,
  styleLevel: 7,
  vocalType: "instrumental"
}

Output:
"modern electronic, uplifting cheerful, moderate upbeat tempo, 
 with synthesizers, electronic drums, bass, pristine clarity 
 with professional mastering, instrumental, no vocals, powerful 
 driving dynamics, high quality production"
```

---

## Fast-Build Instructions

### Prerequisites Checklist

- [ ] Modal account (sign up at [modal.com](https://modal.com))
- [ ] Supabase project with Edge Functions enabled
- [ ] Python 3.8+ installed
- [ ] Node.js/npm (for Supabase CLI)
- [ ] Git (for AudioCraft installation)

---

### Step 1: Local Setup (5 minutes)

```bash
# 1. Clone or navigate to your project
cd your-project

# 2. Create virtual environment (optional but recommended)
python -m venv venv

# Activate venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# 3. Install Modal CLI
pip install modal

# 4. Authenticate Modal (opens browser)
modal token new
```

**Verification**:
```bash
modal app list  # Should show empty list or existing apps
```

---

### Step 2: Create Modal Function (10 minutes)

**File**: `modal_musicgen.py`

**Minimal Version**:
```python
import modal
from modal import enter
import io
import base64
import torch
import torchaudio

# Container image with AudioCraft
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "ffmpeg", "pkg-config",
                 "libavformat-dev", "libavcodec-dev", "libavutil-dev",
                 "libswscale-dev", "libswresample-dev")
    .pip_install(
        "huggingface_hub[hf_transfer]==0.27.1",
        "torch==2.1.0",
        "torchaudio==2.1.0",
        "transformers==4.35.2",
        "numpy<2",
    )
    .pip_install("git+https://github.com/facebookresearch/audiocraft.git@v1.3.0")
    .pip_install("fastapi", "pydantic")
)

app = modal.App("your-app-name", image=image)

# Model container
@app.cls(gpu="T4", scaledown_window=300, timeout=120)
class MusicGenModel:
    @enter()
    def load_model(self):
        from audiocraft.models import MusicGen
        print("Loading model...")
        self.model = MusicGen.get_pretrained('facebook/musicgen-small')
        print("Model loaded!")
    
    @modal.method()
    def generate(self, prompt: str, duration: int = 30, temperature: float = 1.0):
        self.model.set_generation_params(duration=duration, temperature=temperature)
        with torch.no_grad():
            wav = self.model.generate([prompt])
        
        audio_tensor = wav[0].cpu()
        sample_rate = self.model.sample_rate
        
        buffer = io.BytesIO()
        torchaudio.save(buffer, audio_tensor, sample_rate, format="wav")
        wav_bytes = buffer.getvalue()
        audio_base64 = base64.b64encode(wav_bytes).decode('utf-8')
        
        return {
            "success": True,
            "audio_base64": audio_base64,
            "prompt": prompt,
            "duration": duration,
            "sample_rate": sample_rate,
            "format": "wav"
        }

musicgen_model = MusicGenModel()

# HTTP endpoint
@app.function()
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel
    
    web_app = FastAPI()
    
    class MusicRequest(BaseModel):
        prompt: str
        duration: int = 30
        temperature: float = 1.0
    
    @web_app.post("/")
    async def generate_music(request: MusicRequest):
        if not request.prompt.strip():
            raise HTTPException(400, "Prompt required")
        
        result = musicgen_model.generate.remote(
            prompt=request.prompt,
            duration=request.duration,
            temperature=request.temperature
        )
        
        return JSONResponse(content=result)
    
    return web_app
```

**Save this file** as `modal_musicgen.py` in your project root.

---

### Step 3: Deploy Modal Function (5-10 minutes)

```bash
# Deploy (first time takes ~5-10 min for image build + model download)
modal deploy modal_musicgen.py
```

**Expected Output**:
```
✓ Created objects.
  ├── 🔨 Created your-app-name
  └── 🌐 Created web endpoint: https://your-username--your-app-name-fastapi-app.modal.run
```

**⚠️ COPY THE ENDPOINT URL** - You'll need it for Step 4.

---

### Step 4: Configure Supabase Secrets (2 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Click **Add new secret**
5. Enter:
   - **Name**: `MODAL_API_URL`
   - **Value**: `https://your-username--your-app-name-fastapi-app.modal.run`
6. Click **Save**

---

### Step 5: Create Supabase Edge Function (10 minutes)

**File**: `supabase/functions/generate-music/index.ts`

**Minimal Version**:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  prompt: z.string().min(1).max(500),
  duration: z.number().min(1).max(30).optional().default(30),
  temperature: z.number().min(0.1).max(2.0).optional().default(1.0),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, duration, temperature } = requestSchema.parse(body);
    
    const MODAL_API_URL = Deno.env.get('MODAL_API_URL');
    if (!MODAL_API_URL) {
      return new Response(
        JSON.stringify({ success: false, error: 'MODAL_API_URL not configured' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const modalResponse = await fetch(MODAL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, duration, temperature })
    });

    if (!modalResponse.ok) {
      const errorText = await modalResponse.text();
      return new Response(
        JSON.stringify({ success: false, error: `Modal error: ${modalResponse.status}` }),
        { status: modalResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const modalData = await modalResponse.json();
    const audioDataUrl = `data:audio/wav;base64,${modalData.audio_base64}`;

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: audioDataUrl,
        prompt: modalData.prompt,
        metadata: modalData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### Step 6: Deploy Supabase Function (2 minutes)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy generate-music
```

---

### Step 7: Test End-to-End (2 minutes)

**Test Modal directly**:
```bash
curl -X POST https://your-username--your-app-name-fastapi-app.modal.run \
  -H "Content-Type: application/json" \
  -d '{"prompt": "calm ambient music with piano", "duration": 10}'
```

**Test via Supabase**:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-music \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "upbeat electronic music", "duration": 30}'
```

**Expected Response**:
```json
{
  "success": true,
  "audioUrl": "data:audio/wav;base64,UklGRiQAAABXQVZFZm10...",
  "prompt": "upbeat electronic music",
  "metadata": {
    "duration": 30,
    "sample_rate": 32000,
    "format": "wav",
    "generation_time_seconds": 8.5
  }
}
```

---

## Optimizations & Best Practices

### 1. **Container Warmup Strategy**

**Problem**: Cold starts take 10-30s (model loading).

**Solutions**:
- **Increase `scaledown_window`**: Keep containers warm longer
  ```python
  @app.cls(gpu="T4", scaledown_window=600)  # 10 minutes
  ```
- **Send periodic keepalive requests**: Ping endpoint every 4-5 minutes
- **Use Modal's warm pool** (contact support for enterprise plans)

**Trade-off**: Longer warmup = lower cold start rate but higher idle costs.

---

### 2. **Model Size Selection**

**Options**:
- `musicgen-small` (300M): 5-10s generation, good quality
- `musicgen-medium` (1.5B): 10-20s generation, better quality
- `musicgen-large` (3.3B): 20-30s generation, best quality

**Recommendation**: Start with `small`, upgrade to `medium` if quality needs improvement.

**Code Change**:
```python
self.model = MusicGen.get_pretrained('facebook/musicgen-medium')  # or 'large'
```

---

### 3. **GPU Selection**

**Options**:
- **T4**: $0.0004/sec, 5-15s generation, cost-effective
- **A10G**: $0.0011/sec, 3-8s generation, faster
- **A100**: $0.0029/sec, 2-5s generation, fastest (overkill for most cases)

**Recommendation**: Use T4 for development, A10G for production if speed is critical.

**Code Change**:
```python
@app.cls(gpu="A10G", ...)  # Upgrade from T4
```

---

### 4. **Prompt Engineering Optimization**

**AudioCraft Best Practices** (from code analysis):

1. **Length**: 10-25 words optimal
2. **Structure**: `[genre] [mood] [tempo], [instruments], [quality]`
3. **Musical Terms**: Use concrete musical descriptors
   - ✅ "moderate upbeat tempo"
   - ❌ "fast-ish music"
4. **Quality Markers**: Always include "high quality production"
5. **Instruments**: Specify 2-4 instruments, not too many

**Example Optimized Prompt**:
```
"electronic, uplifting cheerful, moderate upbeat tempo, 
 with synthesizers, electronic drums, bass, 
 pristine clarity with professional mastering, 
 instrumental, no vocals, powerful driving dynamics, 
 high quality production"
```

---

### 5. **Error Handling & Retry Logic**

**Retryable Errors**:
- `503 Service Unavailable`: Model loading, retry after 10s
- `429 Too Many Requests`: Rate limited, retry with exponential backoff
- `500 Internal Server Error`: Transient GPU issue, retry once

**Non-Retryable Errors**:
- `400 Bad Request`: Invalid input, don't retry

**Implementation** (Edge Function):
```typescript
const MAX_RETRIES = 3;
let retries = 0;

while (retries < MAX_RETRIES) {
  const response = await fetch(MODAL_API_URL, ...);
  
  if (response.status === 503 || response.status === 429) {
    retries++;
    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    continue;
  }
  
  // Handle success or non-retryable error
  break;
}
```

---

### 6. **Caching Strategy**

**Opportunities**:
1. **Prompt-based caching**: Cache audio for identical prompts (Redis/Supabase Storage)
2. **Model output caching**: Modal caches model weights, but not outputs
3. **CDN caching**: Cache generated audio URLs (if using storage)

**Implementation** (pseudo-code):
```typescript
// In Edge Function
const cacheKey = `music:${hashPrompt(prompt)}:${duration}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return { success: true, audioUrl: cached, cached: true };
}

const result = await generateMusic(prompt);
await redis.set(cacheKey, result.audioUrl, { ttl: 86400 }); // 24h
return result;
```

---

### 7. **Cost Optimization**

**Strategies**:
1. **Use smallest model that meets quality needs**
2. **Reduce generation duration** (15s instead of 30s = ~50% cost reduction)
3. **Batch requests** (if possible, generate multiple variations in one call)
4. **Monitor usage**: Set up Modal billing alerts
5. **Right-size GPU**: T4 is sufficient for most use cases

**Cost Calculation**:
```
T4 GPU: $0.0004/sec
Generation time: 10s
Cost per generation: $0.004

1000 generations/month = $4/month (T4)
1000 generations/month = $11/month (A10G)
```

---

### 8. **Monitoring & Observability**

**Modal Dashboard**:
- View logs: `modal logs your-app-name --tail`
- Monitor costs: Dashboard → Billing
- Track performance: Dashboard → Metrics

**Add Custom Logging**:
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@modal.method()
def generate(self, ...):
    logger.info(f"Generating music: prompt={prompt[:50]}...")
    # ... generation ...
    logger.info(f"Generation complete: {generation_time:.2f}s")
```

**Supabase Logs**:
```bash
supabase functions logs generate-music --tail
```

---

## Quick Reference

### Deployment Commands

```bash
# Modal deployment
modal deploy modal_musicgen.py

# View Modal logs
modal logs your-app-name --tail

# Supabase deployment
supabase functions deploy generate-music

# View Supabase logs
supabase functions logs generate-music --tail
```

### Configuration Files

- **Modal Function**: `modal_musicgen.py`
- **Supabase Function**: `supabase/functions/generate-music/index.ts`
- **Prompt Builder**: `supabase/functions/_shared/audiocraft-prompt.ts`

### Environment Variables

- **Supabase Secret**: `MODAL_API_URL` (Modal endpoint URL)

### API Endpoints

- **Modal Direct**: `https://your-username--your-app-name-fastapi-app.modal.run`
- **Supabase Proxy**: `https://your-project.supabase.co/functions/v1/generate-music`

### Request Format

```json
{
  "prompt": "upbeat electronic music with synthesizers",
  "duration": 30,
  "temperature": 1.0
}
```

### Response Format

```json
{
  "success": true,
  "audio_base64": "base64-encoded-wav-data",
  "prompt": "upbeat electronic music with synthesizers",
  "duration": 30,
  "sample_rate": 32000,
  "size_bytes": 1234567,
  "generation_time_seconds": 8.5,
  "format": "wav"
}
```

---

## Architecture Patterns Summary

### Pattern 1: Class-Based Lifecycle (`@app.cls`)

**Use Case**: Stateful ML models that need initialization  
**Benefits**: Model loaded once, reused across requests  
**Trade-off**: Container must stay warm (memory cost)

### Pattern 2: FastAPI + ASGI Integration

**Use Case**: Expose Python functions as HTTP endpoints  
**Benefits**: Automatic validation, OpenAPI docs, async support  
**Trade-off**: Slight overhead vs. raw HTTP handlers

### Pattern 3: Edge Function Proxy

**Use Case**: Transform requests, handle auth, add business logic  
**Benefits**: Separation of concerns, environment-based routing  
**Trade-off**: Additional latency (~50-100ms)

### Pattern 4: Prompt Engineering Layer

**Use Case**: Convert structured data to model-optimized prompts  
**Benefits**: Better model performance, reusable logic  
**Trade-off**: Additional complexity

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "MODAL_API_URL not configured" | Add secret in Supabase Dashboard |
| Modal returns 503 | Model loading, wait 10-30s and retry |
| Slow generation (>30s) | Use smaller model or upgrade GPU |
| Out of memory | Use `musicgen-small` instead of `large` |
| Cold starts too slow | Increase `scaledown_window` or use keepalive |
| High costs | Use T4 GPU, reduce duration, monitor usage |

---

## Next Steps

1. ✅ Deploy and test basic flow
2. ✅ Monitor performance and costs
3. ✅ Add prompt caching (if needed)
4. ✅ Implement retry logic in edge function
5. ✅ Add custom logging/metrics
6. ✅ Optimize prompt engineering based on results
7. ✅ Consider batch generation for variations

---

**Document Status**: ✅ Complete - Ready for implementation  
**Tested**: ✅ Working implementation analyzed  
**Last Verified**: Current codebase

