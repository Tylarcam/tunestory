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
    model_size: Optional[str] = "small"  # 'small', 'medium', 'large', 'melody'

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
        
        # Load model if needed
        try:
            model = load_model(request.model_size or "small")
        except Exception as e:
            return GenerateResponse(
                success=False,
                prompt=request.prompt,
                error=f"Failed to load model: {str(e)}",
                metadata={}
            )
        
        # Set generation parameters
        model.set_generation_params(
            duration=request.duration or 30,
            temperature=request.temperature or 1.0
        )
        
        print(f"🎵 Generating music...")
        print(f"   Prompt: {request.prompt}")
        print(f"   Duration: {request.duration or 30}s")
        print(f"   Temperature: {request.temperature or 1.0}")
        
        # Generate audio
        with torch.no_grad():
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
                "model": f"facebook/musicgen-{request.model_size or 'small'}",
                "model_size": request.model_size or "small",
                "duration": request.duration or 30,
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

