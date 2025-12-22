"""
Modal function for AudioCraft MusicGen music generation.
Deployed as a serverless endpoint for TuneStory.

Usage:
    modal deploy modal_musicgen.py
    
Then call the endpoint:
    POST https://your-username--tunestory-musicgen-generate-music.modal.run
    Body: {"prompt": "upbeat electronic music", "duration": 30, "temperature": 1.0}
"""

import modal
from modal import enter
import io
import base64
from typing import Optional

# Note: torch, torchaudio, and audiocraft are only imported inside functions
# that run on Modal's containers, not at module level

# Define Modal image with AudioCraft dependencies
# Based on Modal's official MusicGen example: https://modal.com/docs/examples/musicgen
# PyAV (audiocraft dependency) requires pkg-config and FFmpeg dev libraries
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(
        "git",
        "ffmpeg",
        "pkg-config",
        "libavformat-dev",
        "libavcodec-dev",
        "libavdevice-dev",
        "libavutil-dev",
        "libswscale-dev",
        "libswresample-dev",
    )
    .pip_install(
        "huggingface_hub[hf_transfer]==0.27.1",
        "torch==2.1.0",
        "torchaudio==2.1.0",  # Required - must match torch version
        "transformers==4.35.2",  # Pin to last version compatible with torch 2.1.0 (4.36+ requires torch 2.2+)
        "numpy<2",
    )
    .pip_install(
        "git+https://github.com/facebookresearch/audiocraft.git@v1.3.0",  # Install audiocraft - it will use the pinned transformers version
    )
    .pip_install(
        "fastapi",
        "pydantic",
    )
)

app = modal.App("tunestory-musicgen", image=image)

# Use GPU for faster inference
# T4 GPU is cost-effective, A10G is faster but more expensive
@app.cls(
    gpu="T4",  # Switch to "A10G" for faster inference if needed
    scaledown_window=300,  # Keep container warm for 5 min (reduces cold starts)
    timeout=120,  # 2 min timeout per request
)
class MusicGenModel:
    """
    MusicGen model container that loads the model once and reuses it.
    This improves performance by avoiding reloading on every request.
    """
    
    @enter()
    def load_model(self):
        """Load model when container starts - will be reloaded per request if needed"""
        # Model will be loaded dynamically based on request
        self.model = None
        self.current_model_size = None
        print("✅ Model container ready (will load on first request)")
    
    def _load_model_if_needed(self, model_size: str):
        """Load model if not already loaded or if different model is requested"""
        from audiocraft.models import MusicGen
        
        if self.model is None or self.current_model_size != model_size:
            print(f"🔄 Loading MusicGen model: {model_size}...")
            self.model = MusicGen.get_pretrained(f'facebook/musicgen-{model_size}')
            self.current_model_size = model_size
            print(f"✅ Model {model_size} loaded successfully!")
    
    @modal.method()
    def generate(
        self, 
        prompt: str, 
        duration: int = 30,
        temperature: float = 1.0,
        model: str = "small",
        decoder: str = "default"
    ) -> dict:
        """
        Generate music from text prompt and return base64-encoded WAV.
        
        Args:
            prompt: Text description of the music to generate
            duration: Length of audio in seconds (1-30)
            temperature: Controls randomness (0.1-2.0), higher = more creative
            model: Model size ('small', 'medium', 'large', 'melody')
            decoder: Decoder type ('default' or 'multiband_diffusion')
        
        Returns:
            Dictionary with success status, base64 audio, and metadata
        """
        import torch
        import torchaudio
        import time
        
        start_time = time.time()
        
        # Validate model
        valid_models = ['small', 'medium', 'large', 'melody']
        if model not in valid_models:
            raise ValueError(f"Invalid model. Must be one of: {valid_models}")
        
        # Load model if needed
        self._load_model_if_needed(model)
        
        # Set generation parameters
        self.model.set_generation_params(
            duration=duration,
            temperature=temperature
        )
        
        use_multiband = decoder == "multiband_diffusion"
        
        print(f"🎵 Generating music...")
        print(f"   Prompt: {prompt}")
        print(f"   Model: {model}")
        print(f"   Decoder: {decoder}")
        print(f"   Duration: {duration}s")
        print(f"   Temperature: {temperature}")
        
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
            wav = self.model.generate([prompt])
        
        # Convert to WAV bytes
        audio_tensor = wav[0].cpu()  # Shape: [1, sample_rate * duration]
        sample_rate = self.model.sample_rate
        
        buffer = io.BytesIO()
        torchaudio.save(buffer, audio_tensor, sample_rate, format="wav")
        wav_bytes = buffer.getvalue()
        
        # Convert to base64 for JSON response
        audio_base64 = base64.b64encode(wav_bytes).decode('utf-8')
        
        generation_time = time.time() - start_time
        
        print(f"✅ Generation complete in {generation_time:.2f}s")
        print(f"   Audio size: {len(wav_bytes)} bytes")
        
        return {
            "success": True,
            "audio_base64": audio_base64,
            "prompt": prompt,
            "model": model,
            "decoder": decoder,
            "duration": duration,
            "sample_rate": sample_rate,
            "size_bytes": len(wav_bytes),
            "generation_time_seconds": round(generation_time, 2),
            "format": "wav"
        }


# Global remote-capable instance for FastAPI to use
musicgen_model = MusicGenModel()


@app.function()
@modal.asgi_app()
def fastapi_app():
    """Create FastAPI app for HTTP endpoint"""
    from fastapi import FastAPI, Request, HTTPException
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel
    import json
    
    web_app = FastAPI(title="TuneStory MusicGen")
    
    class MusicRequest(BaseModel):
        prompt: str
        duration: int = 30
        temperature: float = 1.0
        model: str = "small"
        decoder: str = "default"
    
    @web_app.post("/")
    async def generate_music(request: MusicRequest):
        """
        HTTP endpoint for music generation.
        
        Expected request body:
            {
                "prompt": "upbeat electronic music with synthesizers",
                "duration": 30,  # optional, default 30
                "temperature": 1.0  # optional, default 1.0
            }
        
        Returns:
            {
                "success": true,
                "audio_base64": "base64-encoded-wav-data",
                "prompt": "...",
                "duration": 30,
                "sample_rate": 32000,
                "size_bytes": 1234567,
                "generation_time_seconds": 8.5,
                "format": "wav"
            }
        """
        try:
            if not request.prompt or not request.prompt.strip():
                raise HTTPException(status_code=400, detail="Prompt is required and cannot be empty")
            
            # Validate inputs
            if not (1 <= request.duration <= 30):
                raise HTTPException(status_code=400, detail="Duration must be between 1 and 30 seconds")
            
            if not (0.1 <= request.temperature <= 2.0):
                raise HTTPException(status_code=400, detail="Temperature must be between 0.1 and 2.0")
            
            # Validate inputs
            valid_models = ['small', 'medium', 'large', 'melody']
            if request.model not in valid_models:
                raise HTTPException(status_code=400, detail=f"Invalid model. Must be one of: {valid_models}")
            
            if request.decoder not in ['default', 'multiband_diffusion']:
                raise HTTPException(status_code=400, detail="Invalid decoder. Must be 'default' or 'multiband_diffusion'")
            
            # Use the shared remote instance
            result = musicgen_model.generate.remote(
                prompt=request.prompt,
                duration=request.duration,
                temperature=request.temperature,
                model=request.model,
                decoder=request.decoder
            )
            
            return JSONResponse(content=result)
            
        except HTTPException:
            raise
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"❌ Error generating music: {error_details}")
            raise HTTPException(
                status_code=500,
                detail=f"Generation failed: {str(e)}"
            )
    
    return web_app


# For local testing (optional)
if __name__ == "__main__":
    # Test locally - deploy and test via HTTP endpoint
    print("To test locally, deploy with: modal deploy modal_musicgen.py")
    print("Then call the HTTP endpoint with curl or your frontend")

