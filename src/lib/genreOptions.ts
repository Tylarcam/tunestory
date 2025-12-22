/**
 * Genre definitions and utilities
 * Single source of truth for all genre-related data
 */

export interface Genre {
  id: string;
  label: string;
  description: string;
  icon: string;
  energyFit: string[];
  tags: string[];
}

// Core genres
export const GENRES: Record<string, Genre> = {
  'electronic': {
    id: 'electronic',
    label: 'Electronic',
    description: 'Synthesizers, electronic drums, and digital sounds',
    icon: '🎛️',
    energyFit: ['Low', 'Medium', 'High'],
    tags: ['edm', 'synth', 'digital'],
  },
  'ambient-electronic': {
    id: 'ambient-electronic',
    label: 'Ambient Electronic',
    description: 'Atmospheric electronic soundscapes',
    icon: '🌌',
    energyFit: ['Low', 'Medium'],
    tags: ['ambient', 'atmospheric', 'chill'],
  },
  'lofi-hiphop': {
    id: 'lofi-hiphop',
    label: 'Lofi Hip Hop',
    description: 'Chill beats with nostalgic vibes',
    icon: '☕',
    energyFit: ['Low', 'Medium'],
    tags: ['chill', 'study', 'relaxed'],
  },
  'jazz-fusion': {
    id: 'jazz-fusion',
    label: 'Jazz Fusion',
    description: 'Smooth jazz with modern elements',
    icon: '🎷',
    energyFit: ['Low', 'Medium'],
    tags: ['jazz', 'smooth', 'sophisticated'],
  },
  'indie-rock': {
    id: 'indie-rock',
    label: 'Indie Rock',
    description: 'Alternative rock with organic instrumentation',
    icon: '🎸',
    energyFit: ['Medium', 'High'],
    tags: ['rock', 'alternative', 'organic'],
  },
  'cinematic-orchestral': {
    id: 'cinematic-orchestral',
    label: 'Cinematic Orchestral',
    description: 'Epic orchestral arrangements',
    icon: '🎬',
    energyFit: ['Low', 'Medium', 'High'],
    tags: ['orchestral', 'epic', 'emotional'],
  },
  'pop': {
    id: 'pop',
    label: 'Pop',
    description: 'Catchy melodies and modern production',
    icon: '🎵',
    energyFit: ['Medium', 'High'],
    tags: ['catchy', 'mainstream', 'upbeat'],
  },
  'rock': {
    id: 'rock',
    label: 'Rock',
    description: 'Classic rock with electric guitars',
    icon: '🎸',
    energyFit: ['Medium', 'High'],
    tags: ['guitar', 'energetic', 'classic'],
  },
  'folk': {
    id: 'folk',
    label: 'Folk',
    description: 'Acoustic instruments and storytelling',
    icon: '🪕',
    energyFit: ['Low', 'Medium'],
    tags: ['acoustic', 'organic', 'intimate'],
  },
  'classical': {
    id: 'classical',
    label: 'Classical',
    description: 'Traditional orchestral music',
    icon: '🎻',
    energyFit: ['Low', 'Medium'],
    tags: ['orchestral', 'traditional', 'elegant'],
  },
  'hip-hop': {
    id: 'hip-hop',
    label: 'Hip Hop',
    description: 'Beats, bass, and urban vibes',
    icon: '🎤',
    energyFit: ['Medium', 'High'],
    tags: ['urban', 'beats', 'rhythmic'],
  },
  'r&b': {
    id: 'r&b',
    label: 'R&B',
    description: 'Smooth vocals and soulful grooves',
    icon: '🎹',
    energyFit: ['Low', 'Medium'],
    tags: ['soulful', 'smooth', 'vocal'],
  },
  'dance': {
    id: 'dance',
    label: 'Dance',
    description: 'Energetic electronic dance music',
    icon: '💃',
    energyFit: ['High'],
    tags: ['edm', 'energetic', 'party'],
  },
  'ambient': {
    id: 'ambient',
    label: 'Ambient',
    description: 'Atmospheric and minimal',
    icon: '🌊',
    energyFit: ['Low'],
    tags: ['atmospheric', 'minimal', 'meditative'],
  },
};

/**
 * Get genre by ID
 */
export function getGenre(id: string): Genre | null {
  return GENRES[id] || null;
}

/**
 * Get all genres as array
 */
export function getAllGenres(): Genre[] {
  return Object.values(GENRES);
}

/**
 * Get genre label by ID
 */
export function getGenreLabel(id: string): string {
  const genre = GENRES[id];
  return genre?.label || id;
}

/**
 * Map Gemini's suggested genre to our genre ID
 */
export function mapGeminiGenreToOption(geminiGenre: string): string {
  if (!geminiGenre) return 'electronic';
  
  const normalized = geminiGenre.toLowerCase().trim();
  
  // Direct matches
  if (normalized in GENRES) {
    return normalized;
  }
  
  // Fuzzy matching
  const mapping: Record<string, string> = {
    'electronic': 'electronic',
    'electronica': 'electronic',
    'edm': 'electronic',
    'ambient': 'ambient',
    'ambient electronic': 'ambient-electronic',
    'lofi': 'lofi-hiphop',
    'lo-fi': 'lofi-hiphop',
    'lo fi': 'lofi-hiphop',
    'lofi hip hop': 'lofi-hiphop',
    'jazz': 'jazz-fusion',
    'jazz fusion': 'jazz-fusion',
    'indie': 'indie-rock',
    'indie rock': 'indie-rock',
    'rock': 'rock',
    'pop': 'pop',
    'orchestral': 'cinematic-orchestral',
    'cinematic': 'cinematic-orchestral',
    'classical': 'classical',
    'folk': 'folk',
    'hip hop': 'hip-hop',
    'hiphop': 'hip-hop',
    'r&b': 'r&b',
    'rnb': 'r&b',
    'soul': 'r&b',
    'dance': 'dance',
    'house': 'dance',
    'techno': 'dance',
  };
  
  // Check for partial matches
  for (const [key, value] of Object.entries(mapping)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Default fallback
  return 'electronic';
}

