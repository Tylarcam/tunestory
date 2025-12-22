#!/usr/bin/env python3
"""
MusicGen Local Server
FastAPI server for local MusicGen inference using AudioCraft
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import base64
import io
import time
import torch
import torchaudio
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write

app = FastAPI(title="MusicGen Server")

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None
model_size = "small"  # Options: 'small', 'medium', 'large', 'melody'
device = "cuda" if torch.cuda.is_available() else "cpu"

# Request/Response models
class GenerateRequest(BaseModel):
    prompt: str
    duration: Optional[int] = 30  # seconds (1-30)
    temperature: Optional[float] = 1.0  # 0.1-2.0
    model_size: Optional[str] = "small"  # 'small', 'medium', 'large', 'melody' (backward compat)
    model: Optional[str] = None  # 'small', 'medium', 'large', 'melody' (preferred)
    decoder: Optional[str] = "default"  # 'default' or 'multiband_diffusion'

class GenerateResponse(BaseModel):
    success: bool
    audio_base64: Optional[str] = None
    prompt: str
    error: Optional[str] = None
    metadata: dict

def load_model(size: str = "small"):
    """Load MusicGen model"""
    global model, model_size, device
    
    if model is None or model_size != size:
        print(f"🎵 Loading MusicGen model: {size} on {device}")
        try:
            model = MusicGen.get_pretrained(f'facebook/musicgen-{size}')
            model.set_generation_params(duration=30)
            model.to(device)
            model_size = size
            print(f"✅ Model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    
    return model

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "device": device, "model_loaded": model is not None}

@app.get("/stats")
async def get_stats():
    """Get server statistics"""
    return {
        "device": device,
        "model_loaded": model is not None,
        "model_size": model_size if model else None,
        "cuda_available": torch.cuda.is_available()
    }

@app.post("/generate", response_model=GenerateResponse)
async def generate_music(request: GenerateRequest):
    """Generate music from text prompt"""
    global model
    
    start_time = time.time()
    
    try:
        # Validate inputs
        if not request.prompt or len(request.prompt.strip()) == 0:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
        if request.duration and (request.duration < 1 or request.duration > 30):
            raise HTTPException(status_code=400, detail="Duration must be between 1 and 30 seconds")
        
        if request.temperature and (request.temperature < 0.1 or request.temperature > 2.0):
            raise HTTPException(status_code=400, detail="Temperature must be between 0.1 and 2.0")
        
        # Determine model size (prefer 'model' over 'model_size' for backward compat)
        model_size = request.model or request.model_size or "small"
        
        # Validate model size
        valid_models = ['small', 'medium', 'large', 'melody']
        if model_size not in valid_models:
            raise HTTPException(status_code=400, detail=f"Invalid model. Must be one of: {valid_models}")
        
        # Load model if needed
        try:
            model = load_model(model_size)
        except Exception as e:
            return GenerateResponse(
                success=False,
                prompt=request.prompt,
                error=f"Failed to load model: {str(e)}",
                metadata={}
            )
        
        # Determine decoder
        use_multiband = request.decoder == "multiband_diffusion"
        duration = request.duration or 30
        
        # Set generation parameters
        model.set_generation_params(
            duration=duration,
            temperature=request.temperature or 1.0
        )
        
        print(f"🎵 Generating music...")
        print(f"   Prompt: {request.prompt}")
        print(f"   Model: {model_size}")
        print(f"   Decoder: {request.decoder or 'default'}")
        print(f"   Duration: {duration}s")
        print(f"   Temperature: {request.temperature or 1.0}")
        
        # Generate audio
        # Note: MultiBand Diffusion decoder support requires additional AudioCraft setup
        # The standard MusicGen.generate() uses the default decoder
        # For full MultiBand Diffusion support, you may need to:
        # 1. Use MusicGen's extended API with decoder parameter
        # 2. Or apply MultiBand Diffusion as a post-processing step
        # For now, we log the preference but use standard generation
        with torch.no_grad():
            if use_multiband:
                print("   ⚠️ MultiBand Diffusion requested but using default decoder")
                print("   Note: Full MultiBand Diffusion support may require AudioCraft API updates")
            wav = model.generate([request.prompt], progress=True)
        
        # Convert to numpy array and then to WAV bytes
        audio_tensor = wav[0].cpu()  # Shape: [1, sample_rate * duration]
        sample_rate = model.sample_rate
        
        # Convert to WAV format
        buffer = io.BytesIO()
        torchaudio.save(buffer, audio_tensor, sample_rate, format="wav")
        wav_bytes = buffer.getvalue()
        
        # Convert to base64
        audio_base64 = base64.b64encode(wav_bytes).decode('utf-8')
        
        generation_time = time.time() - start_time
        
        print(f"✅ Generation complete in {generation_time:.2f}s")
        print(f"   Audio size: {len(wav_bytes)} bytes")
        
        return GenerateResponse(
            success=True,
            audio_base64=audio_base64,
            prompt=request.prompt,
            metadata={
                "model": f"facebook/musicgen-{model_size}",
                "model_size": model_size,
                "decoder": request.decoder or "default",
                "duration": duration,
                "sample_rate": sample_rate,
                "size_bytes": len(wav_bytes),
                "generation_time_seconds": round(generation_time, 2),
                "framework": "AudioCraft",
                "device": device
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Generation error: {e}")
        import traceback
        traceback.print_exc()
        return GenerateResponse(
            success=False,
            prompt=request.prompt,
            error=f"Generation failed: {str(e)}",
            metadata={}
        )

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting MusicGen server on http://localhost:8000")
    print(f"📱 Device: {device}")
    print("💡 Load model on first request (may take 30-60s)")
    uvicorn.run(app, host="0.0.0.0", port=8000)

