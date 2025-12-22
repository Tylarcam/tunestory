/**
 * TypeScript types for MusicGen integration
 */

export interface MusicGenPrompt {
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

export type MusicGenModel = 'small' | 'medium' | 'large' | 'melody'
export type MusicGenDecoder = 'default' | 'multiband_diffusion'

export interface MusicGenRequest {
  prompt: string
  duration?: number  // seconds (1-30)
  temperature?: number  // 0.1-2.0
  model_size?: MusicGenModel
  model?: MusicGenModel  // Alias for model_size for consistency
  decoder?: MusicGenDecoder  // 'default' or 'multiband_diffusion'
}

export interface MusicGenMetadata {
  model: string
  model_size: string
  duration: number
  sample_rate: number
  size_bytes: number
  generation_time_seconds: number
  framework: string
  device: string
}

export interface MusicGenResponse {
  success: boolean
  audio_base64?: string
  prompt: string
  error?: string
  metadata: MusicGenMetadata
}

export interface GeneratedTrack {
  audioUrl: string  // data URL from base64
  prompt: string
  metadata: MusicGenMetadata
}

export type VibeMode = 'discover' | 'generate'

