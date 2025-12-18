import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildMusicGenPrompt } from "../_shared/audiocraft-prompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AudioCraft MusicGen via Hugging Face
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/musicgen-large';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    } = await req.json();
  
    if (!mood || !energy || !genres) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Missing required parameters: mood, energy, genres" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  
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
    });
  
    console.log('🎵 AudioCraft prompt:', musicPrompt);
  
    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
  
    if (!HUGGINGFACE_API_KEY) {
      console.error('HUGGINGFACE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'HUGGINGFACE_API_KEY not configured. Please set it in Supabase Edge Function secrets.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  
    // Call AudioCraft MusicGen via Hugging Face
    console.log('🎵 Calling AudioCraft MusicGen...');
  
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
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AudioCraft API error:', response.status, errorText);
    
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
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    
      throw new Error(`AudioCraft API error: ${response.status} - ${errorText}`);
    }
  
    // Response is audio binary (WAV format)
    const audioBlob = await response.blob();
    const audioBuffer = await audioBlob.arrayBuffer();
  
    console.log('✅ Generated audio:', audioBuffer.byteLength, 'bytes');
  
    // Convert to base64 for data URL
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );
  
    const audioDataUrl = `data:audio/wav;base64,${base64Audio}`;
  
    // Optional: Upload to Supabase Storage for persistence
    // const storageUrl = await uploadToStorage(audioBuffer, musicPrompt);
  
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
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        } 
      }
    );
  
  } catch (error) {
    console.error('❌ Error generating music:', error);
  
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
        retryable: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

