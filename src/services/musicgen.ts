/**
 * MusicGen API Client
 * Handles all communication with local MusicGen server
 */

import type { 
  MusicGenRequest, 
  MusicGenResponse, 
  GeneratedTrack,
  MusicGenPrompt 
} from '@/types/musicgen'
import { buildInstrumentPrompt } from '@/lib/instrumentOptions'

// Local server URL (change if running on different port)
const MUSICGEN_API_URL = 'http://localhost:8000'

// Supabase function URL (fallback option)
const SUPABASE_MUSICGEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-music`

/**
 * Build optimized prompt for MusicGen from visual analysis
 */
export function buildMusicGenPrompt(analysis: MusicGenPrompt): string {
  const {
    mood,
    energy,
    genres,
    tempo_bpm,
    visualElements,
    styleLevel = 5,
    vocalType = 'instrumental'
  } = analysis
  
  // Get primary genre
  const genre = genres[0] || 'instrumental'
  
  // Map mood to descriptors
  const moodDescriptor = getMoodDescriptor(mood)
  
  // Map tempo to descriptor
  const tempoDescriptor = getTempoDescriptor(tempo_bpm)
  
  // Map energy to dynamics
  const energyDescriptor = getEnergyDescriptor(energy)
  
  // Get style descriptor (era + production quality)
  const styleDesc = getStyleDescriptor(styleLevel)
  
  // Get vocal descriptor
  const vocalDesc = getVocalDescriptor(vocalType)
  
  // Get instruments - use buildInstrumentPrompt if we have instrument IDs, otherwise use genre defaults
  const instruments = visualElements.instruments?.length 
    ? buildInstrumentPrompt(visualElements.instruments)
    : getDefaultInstruments(genre)
  
  // Build enhanced prompt following best practices
  const promptParts = [
    styleDesc.era ? `${styleDesc.era} ${genre}` : genre,
    moodDescriptor,
    tempoDescriptor,
    `with ${instruments}`,
    styleDesc.production,
    vocalDesc,
    energyDescriptor,
    'high quality production'
  ].filter(Boolean)
  
  const prompt = promptParts.join(', ')
  
  return prompt
}

// Style Level (0-10) → Era and Production descriptors
function getStyleDescriptor(styleLevel: number): { era: string; production: string } {
  if (styleLevel <= 3) {
    const eras = ['1980s', '1990s', 'vintage']
    const era = eras[Math.floor(styleLevel / 2)] || '1980s'
    return {
      era: `${era} lo-fi`,
      production: 'raw production with vinyl crackle and warm analog character'
    }
  } else if (styleLevel <= 6) {
    return {
      era: '',
      production: 'polished studio recording with clean mix'
    }
  } else {
    const eras = ['modern', '2020s', 'contemporary']
    const era = eras[Math.min(Math.floor((styleLevel - 7) / 1.5), 2)] || '2020s'
    return {
      era: `${era} cinematic`,
      production: 'pristine clarity with professional mastering'
    }
  }
}

// Vocal Type → Descriptor
function getVocalDescriptor(vocalType: 'instrumental' | 'minimal-vocals' | 'vocal-focused'): string {
  switch (vocalType) {
    case 'instrumental':
      return 'instrumental, no vocals'
    case 'minimal-vocals':
      return 'subtle vocal textures and wordless vocals'
    case 'vocal-focused':
      return 'prominent vocals with lead vocal melody'
    default:
      return 'instrumental'
  }
}

// Helper functions for prompt building
function getMoodDescriptor(mood: string): string {
  const descriptors: Record<string, string> = {
    joyful: 'uplifting cheerful',
    melancholic: 'melancholic contemplative',
    energetic: 'energetic vibrant',
    calm: 'calm peaceful',
    nostalgic: 'nostalgic warm',
    triumphant: 'triumphant epic',
    romantic: 'romantic tender',
    adventurous: 'adventurous exciting'
  }
  return descriptors[mood.toLowerCase()] || mood
}

function getTempoDescriptor(bpm: number): string {
  if (bpm < 70) return 'very slow ballad'
  if (bpm < 90) return 'slow gentle tempo'
  if (bpm < 110) return 'medium relaxed tempo'
  if (bpm < 130) return 'moderate upbeat tempo'
  if (bpm < 150) return 'fast energetic tempo'
  return 'very fast intense tempo'
}

function getEnergyDescriptor(energy: number): string {
  if (energy <= 2) return 'very soft gentle dynamics'
  if (energy <= 4) return 'soft mellow dynamics'
  if (energy <= 6) return 'moderate balanced dynamics'
  if (energy <= 8) return 'powerful driving dynamics'
  return 'very intense explosive dynamics'
}

function getDefaultInstruments(genre: string): string {
  const instruments: Record<string, string> = {
    folk: 'acoustic guitar, light percussion',
    electronic: 'synthesizers, electronic drums, bass',
    ambient: 'soft pads, atmospheric textures',
    classical: 'piano, strings, orchestral',
    pop: 'guitar, bass, drums, synth',
    'hip-hop': 'bass, drums, samples',
    jazz: 'piano, saxophone, double bass',
    rock: 'electric guitar, drums, bass guitar'
  }
  return instruments[genre.toLowerCase()] || 'mixed instrumentation'
}

/**
 * Check if MusicGen server is running
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${MUSICGEN_API_URL}/health`, {
      method: 'GET'
    })
    return response.ok
  } catch (error) {
    console.error('MusicGen server not reachable:', error)
    return false
  }
}

/**
 * Generate music from prompt
 * Tries local server first, falls back to Supabase if local server is unavailable
 */
export async function generateMusic(
  request: MusicGenRequest,
  useSupabase: boolean = false
): Promise<GeneratedTrack> {
  // If explicitly using Supabase or local server is down, use Supabase
  if (useSupabase || !(await checkServerHealth())) {
    return generateMusicViaSupabase(request)
  }
  
  // Try local server first
  try {
    console.log('🎵 Calling local MusicGen server...')
    console.log('   Prompt:', request.prompt)
    
    const response = await fetch(`${MUSICGEN_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: request.prompt,
        duration: request.duration || 30,
        temperature: request.temperature || 1.0,
        model_size: request.model_size || request.model || 'small',
        model: request.model || request.model_size || 'small'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Local server error: ${response.status}`)
    }
    
    const data: MusicGenResponse = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Generation failed')
    }
    
    if (!data.audio_base64) {
      throw new Error('No audio data received')
    }
    
    // Convert base64 to data URL for audio playback
    const audioUrl = `data:audio/wav;base64,${data.audio_base64}`
    
    console.log('✅ Music generated successfully (local)')
    console.log('   Size:', data.metadata.size_bytes, 'bytes')
    console.log('   Time:', data.metadata.generation_time_seconds, 'seconds')
    
    return {
      audioUrl,
      prompt: data.prompt,
      metadata: data.metadata
    }
    
  } catch (error) {
    console.warn('⚠️ Local server failed, falling back to Supabase:', error)
    return generateMusicViaSupabase(request)
  }
}

/**
 * Generate music via Supabase function (uses Hugging Face API)
 */
async function generateMusicViaSupabase(
  request: MusicGenRequest
): Promise<GeneratedTrack> {
  try {
    console.log('🎵 Calling Supabase MusicGen function...')
    console.log('   Prompt:', request.prompt)
    
    // Parse prompt to extract mood/energy/genres (basic parsing)
    // For now, we'll send the prompt as-is and let Supabase handle it
    // In a real implementation, you'd parse the prompt back to structured data
    
    const response = await fetch(SUPABASE_MUSICGEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
      },
      body: JSON.stringify({
        // For Supabase, we need to send structured data
        // Since we only have a prompt, we'll extract what we can
        // Or use a default structure
        mood: 'energetic', // Default - in real app, parse from prompt
        energy: 7,
        genres: ['electronic'],
        tempo_bpm: 120,
        description: request.prompt,
        visualElements: {}
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }))
      throw new Error(errorData.error || `Supabase error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Generation failed')
    }
    
    // Supabase returns audioUrl directly (data URL)
    if (!data.audioUrl) {
      throw new Error('No audio data received')
    }
    
    console.log('✅ Music generated successfully (Supabase)')
    console.log('   Model:', data.metadata?.model || 'Hugging Face')
    
    return {
      audioUrl: data.audioUrl,
      prompt: data.prompt || request.prompt,
      metadata: data.metadata || {
        model: 'Hugging Face MusicGen',
        model_size: 'large',
        duration: request.duration || 30,
        sample_rate: 32000,
        size_bytes: 0,
        generation_time_seconds: 0,
        framework: 'Hugging Face API',
        device: 'cloud'
      }
    }
    
  } catch (error) {
    console.error('❌ Supabase MusicGen error:', error)
    throw error
  }
}

/**
 * Get server statistics
 */
export async function getServerStats() {
  try {
    const response = await fetch(`${MUSICGEN_API_URL}/stats`)
    return await response.json()
  } catch (error) {
    console.error('Failed to get server stats:', error)
    return null
  }
}

/**
 * Quick test generation (5 seconds, for testing)
 */
export async function testGeneration(): Promise<GeneratedTrack> {
  return generateMusic({
    prompt: 'upbeat electronic music, 120 BPM',
    duration: 5,
    temperature: 1.0,
    model_size: 'small'
  })
}

