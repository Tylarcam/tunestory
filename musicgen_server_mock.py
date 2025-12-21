#!/usr/bin/env python3
"""
MusicGen Mock Server (for testing without AudioCraft)
FastAPI server that simulates MusicGen responses for frontend testing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import base64
import io
import time
import asyncio
import numpy as np

app = FastAPI(title="MusicGen Mock Server")

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class GenerateRequest(BaseModel):
    prompt: str
    duration: Optional[int] = 30
    temperature: Optional[float] = 1.0
    model_size: Optional[str] = "small"

class GenerateResponse(BaseModel):
    success: bool
    audio_base64: Optional[str] = None
    prompt: str
    error: Optional[str] = None
    metadata: dict

def generate_mock_audio(duration_seconds: int = 30, sample_rate: int = 32000):
    """Generate a simple sine wave audio for testing"""
    # Generate a simple tone (440 Hz sine wave)
    t = np.linspace(0, duration_seconds, int(sample_rate * duration_seconds), False)
    frequency = 440.0  # A4 note
    audio_data = np.sin(2 * np.pi * frequency * t)
    
    # Add some variation to make it more interesting
    audio_data += 0.3 * np.sin(2 * np.pi * frequency * 2 * t)  # Octave
    audio_data += 0.2 * np.sin(2 * np.pi * frequency * 3 * t)  # Fifth
    
    # Normalize to prevent clipping
    audio_data = audio_data / np.max(np.abs(audio_data))
    
    # Convert to 16-bit PCM
    audio_data = (audio_data * 32767).astype(np.int16)
    
    return audio_data, sample_rate

def create_wav_file(audio_data, sample_rate):
    """Create a WAV file from numpy array"""
    import wave
    import struct
    
    buffer = io.BytesIO()
    
    with wave.open(buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data.tobytes())
    
    return buffer.getvalue()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "device": "cpu", "model_loaded": True, "mode": "mock"}

@app.get("/stats")
async def get_stats():
    """Get server statistics"""
    return {
        "device": "cpu",
        "model_loaded": True,
        "model_size": "small",
        "cuda_available": False,
        "mode": "mock"
    }

@app.post("/generate", response_model=GenerateResponse)
async def generate_music(request: GenerateRequest):
    """Generate mock music from text prompt"""
    start_time = time.time()
    
    try:
        # Validate inputs
        if not request.prompt or len(request.prompt.strip()) == 0:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
        if request.duration and (request.duration < 1 or request.duration > 30):
            raise HTTPException(status_code=400, detail="Duration must be between 1 and 30 seconds")
        
        if request.temperature and (request.temperature < 0.1 or request.temperature > 2.0):
            raise HTTPException(status_code=400, detail="Temperature must be between 0.1 and 2.0")
        
        print(f"[MOCK] Generating music...")
        print(f"   Prompt: {request.prompt}")
        print(f"   Duration: {request.duration or 30}s")
        print(f"   Temperature: {request.temperature or 1.0}")
        
        # Simulate generation time (1-3 seconds for mock)
        await asyncio.sleep(1.5)
        
        # Generate mock audio (simple sine wave)
        duration = request.duration or 30
        audio_data, sample_rate = generate_mock_audio(duration, sample_rate=32000)
        
        # Convert to WAV format
        wav_bytes = create_wav_file(audio_data, sample_rate)
        
        # Convert to base64
        audio_base64 = base64.b64encode(wav_bytes).decode('utf-8')
        
        generation_time = time.time() - start_time
        
        print(f"[MOCK] Generation complete in {generation_time:.2f}s")
        print(f"   Audio size: {len(wav_bytes)} bytes")
        print(f"   NOTE: This is a MOCK server - install AudioCraft for real generation")
        
        return GenerateResponse(
            success=True,
            audio_base64=audio_base64,
            prompt=request.prompt,
            metadata={
                "model": f"facebook/musicgen-{request.model_size or 'small'}",
                "model_size": request.model_size or "small",
                "duration": duration,
                "sample_rate": sample_rate,
                "size_bytes": len(wav_bytes),
                "generation_time_seconds": round(generation_time, 2),
                "framework": "Mock (AudioCraft not installed)",
                "device": "cpu"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Generation error: {e}")
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
    print("Starting MusicGen MOCK server on http://localhost:8000")
    print("Device: cpu (mock mode)")
    print("NOTE: This is a MOCK server for testing")
    print("Install AudioCraft for real music generation")
    uvicorn.run(app, host="0.0.0.0", port=8000)

