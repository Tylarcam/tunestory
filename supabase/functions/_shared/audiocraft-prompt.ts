interface VisualAnalysis {
  mood: string;
  energy: number | string;
  genres: string[];
  tempo_bpm?: number;
  description?: string;
  setting?: string;
  time_of_day?: string;
  visualElements?: {
    colors?: string[];
    instruments?: string[];
    setting?: string;
    timeOfDay?: string;
    atmosphere?: string;
  };
}

export function buildMusicGenPrompt(analysis: VisualAnalysis): string {
  const {
    mood,
    energy,
    genres,
    tempo_bpm,
    visualElements
  } = analysis;
  
  // AudioCraft MusicGen prompt engineering best practices:
  // 1. Keep it simple and descriptive (10-25 words)
  // 2. Focus on musical attributes (genre, tempo, instruments, mood)
  // 3. Use concrete terms, not abstract concepts
  // 4. Specify quality ("high quality", "professional")
  // 5. AudioCraft understands musical terminology well
  
  const genre = genres[0] || 'instrumental';
  const moodDesc = getMoodDescriptor(mood);
  
  // Convert energy to number if it's a string
  const energyNum = typeof energy === 'string' 
    ? energy === 'High' ? 8 : energy === 'Medium' ? 5 : 3
    : energy;
  
  const tempoDesc = tempo_bpm ? getTempoDescriptor(tempo_bpm) : getTempoFromEnergy(energyNum);
  const energyDesc = getEnergyDescriptor(energyNum);
  
  // Get instruments from visual analysis or defaults
  const instruments = visualElements?.instruments?.length 
    ? visualElements.instruments.slice(0, 3).join(', ')
    : getDefaultInstruments(genre);
  
  // Build concise, musical prompt
  // Format: [genre] [mood] [tempo], [instruments], [energy], [quality]
  const prompt = `${genre} ${moodDesc} ${tempoDesc}, ${instruments}, ${energyDesc}, high quality production`;
  
  return prompt;
}

// Mood → Musical descriptors
function getMoodDescriptor(mood: string): string {
  const descriptors: Record<string, string> = {
    joyful: 'uplifting cheerful',
    melancholic: 'melancholic contemplative',
    energetic: 'energetic vibrant',
    calm: 'calm peaceful',
    peaceful: 'calm peaceful',
    nostalgic: 'nostalgic warm',
    triumphant: 'triumphant epic',
    romantic: 'romantic tender',
    adventurous: 'adventurous exciting',
    mysterious: 'mysterious atmospheric',
    dramatic: 'dramatic cinematic',
    happy: 'uplifting cheerful',
    sad: 'melancholic contemplative',
    excited: 'energetic vibrant',
    relaxed: 'calm peaceful',
    atmospheric: 'atmospheric ambient'
  };
  
  const lowerMood = mood.toLowerCase();
  return descriptors[lowerMood] || lowerMood;
}

// BPM → Tempo descriptor
function getTempoDescriptor(bpm: number): string {
  if (bpm < 70) return 'very slow ballad';
  if (bpm < 90) return 'slow gentle tempo';
  if (bpm < 110) return 'medium relaxed tempo';
  if (bpm < 130) return 'moderate upbeat tempo';
  if (bpm < 150) return 'fast energetic tempo';
  return 'very fast intense tempo';
}

// Energy → Tempo (fallback when BPM not available)
function getTempoFromEnergy(energy: number): string {
  if (energy <= 2) return 'very slow ballad';
  if (energy <= 4) return 'slow gentle tempo';
  if (energy <= 6) return 'medium relaxed tempo';
  if (energy <= 8) return 'moderate upbeat tempo';
  return 'fast energetic tempo';
}

// Energy → Dynamic descriptor
function getEnergyDescriptor(energy: number): string {
  if (energy <= 2) return 'very soft gentle dynamics';
  if (energy <= 4) return 'soft mellow dynamics';
  if (energy <= 6) return 'moderate balanced dynamics';
  if (energy <= 8) return 'powerful driving dynamics';
  return 'very intense explosive dynamics';
}

// Genre → Default instrumentation
function getDefaultInstruments(genre: string): string {
  const instruments: Record<string, string> = {
    folk: 'acoustic guitar, light percussion',
    electronic: 'synthesizers, electronic drums, bass',
    ambient: 'soft pads, atmospheric textures',
    classical: 'piano, strings, orchestral',
    pop: 'guitar, bass, drums, synth',
    'hip-hop': 'bass, drums, samples',
    hiphop: 'bass, drums, samples',
    jazz: 'piano, saxophone, double bass',
    rock: 'electric guitar, drums, bass guitar',
    metal: 'distorted guitar, heavy drums',
    country: 'acoustic guitar, fiddle, banjo',
    blues: 'guitar, harmonica, bass',
    reggae: 'guitar, bass, offbeat rhythm',
    latin: 'percussion, guitar, brass',
    indie: 'guitar, synth, drums',
    alternative: 'guitar, bass, drums',
    dance: 'synthesizers, electronic drums, bass',
    house: 'synthesizers, electronic drums, bass',
    techno: 'synthesizers, electronic drums',
    'r&b': 'smooth bass, drums, synth',
    rnb: 'smooth bass, drums, synth',
    soul: 'piano, bass, drums, strings'
  };
  
  const lowerGenre = genre.toLowerCase();
  return instruments[lowerGenre] || 'mixed instrumentation';
}

// Export for testing
export const testPromptBuilder = {
  getMoodDescriptor,
  getTempoDescriptor,
  getEnergyDescriptor,
  getDefaultInstruments
};

