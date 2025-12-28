/**
<<<<<<< HEAD
 * Genre definitions and mapping utilities
 * Provides categorized genre options for user selection
 */

export interface GenreOption {
  id: string;
  label: string;
  category: string;
}

export interface GenreCategory {
  category: string;
  options: GenreOption[];
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  {
    category: "Electronic",
    options: [
      { id: "lofi-hiphop", label: "Lofi Hip-Hop", category: "Electronic" },
      { id: "ambient-electronic", label: "Ambient Electronic", category: "Electronic" },
      { id: "synthwave", label: "Synthwave", category: "Electronic" },
      { id: "downtempo", label: "Downtempo", category: "Electronic" },
      { id: "chillwave", label: "Chillwave", category: "Electronic" },
    ],
  },
  {
    category: "Jazz",
    options: [
      { id: "jazz-fusion", label: "Jazz Fusion", category: "Jazz" },
      { id: "smooth-jazz", label: "Smooth Jazz", category: "Jazz" },
      { id: "bebop", label: "Bebop", category: "Jazz" },
      { id: "acid-jazz", label: "Acid Jazz", category: "Jazz" },
    ],
  },
  {
    category: "Classical",
    options: [
      { id: "cinematic-orchestral", label: "Cinematic Orchestral", category: "Classical" },
      { id: "solo-piano", label: "Solo Piano", category: "Classical" },
      { id: "chamber-music", label: "Chamber Music", category: "Classical" },
      { id: "minimalist", label: "Minimalist Classical", category: "Classical" },
    ],
  },
  {
    category: "Hip-Hop",
    options: [
      { id: "boom-bap", label: "Boom Bap", category: "Hip-Hop" },
      { id: "trap", label: "Trap", category: "Hip-Hop" },
      { id: "lofi-beats", label: "Lo-Fi Beats", category: "Hip-Hop" },
      { id: "instrumental-hiphop", label: "Instrumental Hip-Hop", category: "Hip-Hop" },
    ],
  },
  {
    category: "Rock/Indie",
    options: [
      { id: "indie-rock", label: "Indie Rock", category: "Rock/Indie" },
      { id: "post-rock", label: "Post-Rock", category: "Rock/Indie" },
      { id: "dream-pop", label: "Dream Pop", category: "Rock/Indie" },
      { id: "shoegaze", label: "Shoegaze", category: "Rock/Indie" },
    ],
  },
  {
    category: "World",
    options: [
      { id: "bossa-nova", label: "Bossa Nova", category: "World" },
      { id: "flamenco", label: "Flamenco", category: "World" },
      { id: "celtic", label: "Celtic", category: "World" },
      { id: "afrobeat", label: "Afrobeat", category: "World" },
    ],
  },
  {
    category: "Other",
    options: [
      { id: "experimental", label: "Experimental", category: "Other" },
      { id: "soundtrack", label: "Soundtrack", category: "Other" },
      { id: "new-age", label: "New Age", category: "Other" },
      { id: "folk", label: "Folk", category: "Other" },
    ],
  },
];

// Flat list for easy lookup
export const ALL_GENRES: GenreOption[] = GENRE_CATEGORIES.flatMap((cat) =>
  cat.options.map((opt) => ({ ...opt, category: cat.category }))
);

/**
 * Maps Gemini's genre output to a genre option ID
 * Handles various formats and fuzzy matching
 */
export function mapGeminiGenreToOption(geminiGenre: string): string {
  if (!geminiGenre) return "ambient-electronic";

  const normalized = geminiGenre.toLowerCase().replace(/[\s-]/g, "");

  // Direct matches by ID
  const directMatch = ALL_GENRES.find((g) => g.id.replace(/-/g, "") === normalized);
  if (directMatch) return directMatch.id;

  // Direct matches by label
  const labelMatch = ALL_GENRES.find(
    (g) => g.label.toLowerCase().replace(/[\s-]/g, "") === normalized
  );
  if (labelMatch) return labelMatch.id;

  // Fuzzy keyword matches
  const fuzzyMatches: Record<string, string> = {
    lofi: "lofi-hiphop",
    "lofi hiphop": "lofi-hiphop",
    "lofi hip-hop": "lofi-hiphop",
    jazz: "jazz-fusion",
    classical: "solo-piano",
    orchestral: "cinematic-orchestral",
    electronic: "ambient-electronic",
    ambient: "ambient-electronic",
    hiphop: "lofi-beats",
    "hip-hop": "lofi-beats",
    "hip hop": "lofi-beats",
    rock: "indie-rock",
    indie: "indie-rock",
    piano: "solo-piano",
    cinematic: "cinematic-orchestral",
    synth: "synthwave",
    trap: "trap",
    folk: "folk",
    experimental: "experimental",
    soundtrack: "soundtrack",
  };

  for (const [keyword, genreId] of Object.entries(fuzzyMatches)) {
    if (normalized.includes(keyword)) return genreId;
  }

  // Category-based fallback
  if (normalized.includes("jazz")) return "jazz-fusion";
  if (normalized.includes("classical") || normalized.includes("orchestral"))
    return "cinematic-orchestral";
  if (normalized.includes("electronic") || normalized.includes("ambient"))
    return "ambient-electronic";
  if (normalized.includes("rock") || normalized.includes("indie")) return "indie-rock";
  if (normalized.includes("hip") || normalized.includes("rap")) return "lofi-beats";

  // Default fallback
  return "ambient-electronic";
}

/**
 * Gets a genre option by ID
 */
export function getGenreById(id: string): GenreOption | undefined {
  return ALL_GENRES.find((g) => g.id === id);
}

/**
 * Gets the label for a genre ID
 */
export function getGenreLabel(id: string): string {
  const genre = getGenreById(id);
  return genre?.label || id;
}

=======
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

>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
