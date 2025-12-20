import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildMusicGenPrompt } from "../_shared/audiocraft-prompt.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AudioCraft MusicGen via Hugging Face (using new router endpoint)
const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/facebook/musicgen-large';

// Input validation schema
const requestSchema = z.object({
  mood: z.string().min(1).max(100),
  energy: z.string().min(1).max(50),
  genres: z.array(z.string().max(100)).min(1).max(10),
  tempo_bpm: z.number().min(40).max(300).optional(),
  description: z.string().max(500).optional(),
  setting: z.string().max(200).optional(),
  time_of_day: z.string().max(50).optional(),
  visualElements: z.object({
    colors: z.array(z.string().max(50)).max(10).optional(),
    setting: z.string().max(200).optional(),
    timeOfDay: z.string().max(50).optional(),
    atmosphere: z.string().max(200).optional(),
  }).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.issues);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid request parameters",
          details: parseResult.error.issues[0]?.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { 
      mood, 
      energy, 
      genres, 
      tempo_bpm, 
      description, 
      setting,
      time_of_day,
      visualElements 
    } = parseResult.data;
  
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
    console.log('🎵 Calling AudioCraft MusicGen with prompt:', musicPrompt);
  
    // Try simplified request format first (MusicGen via Inference API might need simpler format)
    const requestBody = {
      inputs: musicPrompt,
      parameters: {
        max_new_tokens: 256,
        do_sample: true,
        temperature: 1.0,
        guidance_scale: 3.0
      },
      options: {
        wait_for_model: true,
        use_cache: false
      }
    };

    console.log('Request URL:', HF_API_URL);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AudioCraft API error:', response.status, errorText);
      console.error('Request body was:', JSON.stringify({
        inputs: musicPrompt,
        parameters: {
          max_new_tokens: 256,
          do_sample: true,
          temperature: 1.0,
          top_k: 250,
          top_p: 0.0,
          guidance_scale: 3.0
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      }));
    
      // Handle common errors
      if (response.status === 503) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Model is loading. Please try again in 20-30 seconds.',
            retryable: true,
            details: errorText
          }),
          { 
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Invalid Hugging Face API key. Please check your HUGGINGFACE_API_KEY secret.',
            details: errorText
          }),
          { 
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `AudioCraft API error: ${response.status}`,
          details: errorText,
          status: response.status
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
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
        error: 'Music generation failed',
        retryable: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
