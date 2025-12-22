import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildMusicGenPrompt } from "../_shared/audiocraft-prompt.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AudioCraft MusicGen via Modal (cloud-hosted GPU inference)
// Set MODAL_API_URL in Supabase Edge Function secrets
// Format: https://your-username--tunestory-musicgen-generate-music.modal.run

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
  model: z.enum(['small', 'medium', 'large', 'melody']).optional().default('small'),
  duration: z.number().min(10).max(60).optional().default(30),
  customPrompt: z.string().max(500).optional(), // Custom prompt override
  styleLevel: z.number().min(0).max(10).optional().default(5), // 0-10 production style/era
  vocalType: z.enum(['instrumental', 'minimal-vocals', 'vocal-focused']).optional().default('instrumental'),
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
      visualElements,
      model,
      duration,
      customPrompt,
      styleLevel,
      vocalType
    } = parseResult.data;
  
    // Use custom prompt if provided, otherwise build from analysis
    const musicPrompt = customPrompt || buildMusicGenPrompt({
      mood,
      energy,
      genres,
      tempo_bpm,
      description,
      setting,
      time_of_day,
      visualElements,
      styleLevel,
      vocalType
    });
  
    console.log('🎵 AudioCraft prompt:', musicPrompt);
    if (customPrompt) {
      console.log('   (Using custom prompt from user)');
    }
  
    // Get Modal API URL from environment
    const MODAL_API_URL = Deno.env.get('MODAL_API_URL');
  
    if (!MODAL_API_URL) {
      console.error('MODAL_API_URL not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'MODAL_API_URL not configured. Please set it in Supabase Edge Function secrets.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  
    // Call AudioCraft MusicGen via Modal
    console.log('🎵 Calling Modal AudioCraft endpoint...');
    console.log('   Prompt:', musicPrompt);
    console.log('   Modal URL:', MODAL_API_URL);

    const modalRequestBody = {
      prompt: musicPrompt,
      duration: duration || 30,
      temperature: 1.0,
      model: model || 'small'
    };

    console.log('Request body:', JSON.stringify(modalRequestBody, null, 2));

    const modalResponse = await fetch(MODAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modalRequestBody)
    });
  
    if (!modalResponse.ok) {
      let errorText: string;
      let errorData: any;
      
      try {
        errorText = await modalResponse.text();
        errorData = JSON.parse(errorText);
      } catch {
        errorText = `HTTP ${modalResponse.status} error`;
        errorData = { error: errorText };
      }
      
      console.error('❌ Modal API error:', modalResponse.status, errorText);
    
      // Handle common errors
      if (modalResponse.status === 503 || modalResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: errorData.error || 'Service temporarily unavailable. Please try again in a moment.',
            retryable: true,
            details: errorText
          }),
          { 
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      if (modalResponse.status === 400) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: errorData.error || 'Invalid request. Please check your input parameters.',
            details: errorText
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      if (modalResponse.status === 500) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: errorData.error || 'Modal service error. Please try again.',
            retryable: true,
            details: errorText
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorData.error || `Modal API error: ${modalResponse.status}`,
          details: errorText,
          status: modalResponse.status
        }),
        { 
          status: modalResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  
    // Parse Modal response (expects JSON with audio_base64)
    let modalData: any;
    try {
      modalData = await modalResponse.json();
    } catch (error) {
      console.error('❌ Failed to parse Modal response:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid response from Modal service'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!modalData.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: modalData.error || 'Generation failed',
          details: modalData.details
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!modalData.audio_base64) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No audio data received from Modal service'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  
    // Convert base64 to data URL
    const audioDataUrl = `data:audio/wav;base64,${modalData.audio_base64}`;
  
    console.log('✅ Generated audio:', modalData.size_bytes, 'bytes');
    console.log('   Generation time:', modalData.generation_time_seconds, 'seconds');
  
    // Determine model name for metadata
    const modelNames: Record<string, string> = {
      small: 'AudioCraft MusicGen Small (Meta Research)',
      medium: 'AudioCraft MusicGen Medium (Meta Research)',
      large: 'AudioCraft MusicGen Large (Meta Research)',
      melody: 'AudioCraft MusicGen Melody (Meta Research)'
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: audioDataUrl,
        prompt: musicPrompt,
        metadata: {
          model: modelNames[model || 'small'] || 'AudioCraft MusicGen Small (Meta Research)',
          version: `facebook/musicgen-${model || 'small'}`,
          duration: modalData.duration || duration || 30,
          status: 'generated',
          format: 'wav',
          size: modalData.size_bytes,
          framework: 'AudioCraft (Modal)',
          generation_time_seconds: modalData.generation_time_seconds
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
