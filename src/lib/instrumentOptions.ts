/**
 * Instrument definitions and utilities
 * Single source of truth for all instrument-related data
 */

export interface Instrument {
  id: string;
  label: string;
  promptPhrase: string;
  category: string;
  tags: string[];
  compatibility: string[];
  icon: string;
  energyFit: string[];
}

export interface InstrumentCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  instruments: string[];
  allowMultiple: boolean;
  required: boolean;
}

export interface InstrumentPreset {
  id: string;
  name: string;
  description: string;
  instruments: string[];
  genre?: string;
  energy?: string;
  vibe?: string;
  icon: string;
  tags: string[];
}

export interface ValidationError {
  type: 'category_conflict' | 'empty_selection' | 'too_many';
  message: string;
  category?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Core instruments (12-15 for MVP)
export const INSTRUMENTS: Record<string, Instrument> = {
  // RHYTHM SECTION
  'drums': {
    id: 'drums',
    label: 'Drums',
    promptPhrase: 'crisp drums with tight hi-hats',
    category: 'rhythm',
    tags: ['percussion', 'beat', 'rhythm'],
    compatibility: ['bass', 'piano', 'guitar', 'synth'],
    icon: '🥁',
    energyFit: ['Medium', 'High'],
  },
  
  'soft-drums': {
    id: 'soft-drums',
    label: 'Soft Drums',
    promptPhrase: 'brushed drums and gentle percussion',
    category: 'rhythm',
    tags: ['percussion', 'subtle', 'jazz'],
    compatibility: ['bass', 'piano', 'strings'],
    icon: '🥁',
    energyFit: ['Low', 'Medium'],
  },
  
  // BASS
  'bass': {
    id: 'bass',
    label: 'Bass Guitar',
    promptPhrase: 'warm bass guitar with smooth groove',
    category: 'bass',
    tags: ['low-end', 'foundation', 'groove'],
    compatibility: ['drums', 'piano', 'guitar', 'synth'],
    icon: '🎸',
    energyFit: ['Low', 'Medium', 'High'],
  },
  
  'synth-bass': {
    id: 'synth-bass',
    label: 'Synth Bass',
    promptPhrase: 'deep synthesizer bass with rich sub frequencies',
    category: 'bass',
    tags: ['electronic', 'sub', 'edm'],
    compatibility: ['electronic-beats', 'synth', 'ambient'],
    icon: '🎹',
    energyFit: ['Medium', 'High'],
  },
  
  // KEYS & PIANO
  'piano': {
    id: 'piano',
    label: 'Piano',
    promptPhrase: 'expressive piano melody',
    category: 'keys',
    tags: ['melodic', 'harmonic', 'acoustic'],
    compatibility: ['bass', 'drums', 'strings', 'guitar'],
    icon: '🎹',
    energyFit: ['Low', 'Medium', 'High'],
  },
  
  'electric-piano': {
    id: 'electric-piano',
    label: 'Electric Piano',
    promptPhrase: 'warm Rhodes electric piano',
    category: 'keys',
    tags: ['vintage', 'soul', 'funk'],
    compatibility: ['bass', 'drums', 'guitar'],
    icon: '🎹',
    energyFit: ['Medium', 'High'],
  },
  
  'synth': {
    id: 'synth',
    label: 'Synthesizer',
    promptPhrase: 'lush synthesizer pads and textures',
    category: 'keys',
    tags: ['electronic', 'ambient', 'atmospheric'],
    compatibility: ['bass', 'electronic-beats', 'ambient'],
    icon: '🎛️',
    energyFit: ['Low', 'Medium', 'High'],
  },
  
  // STRINGS
  'strings': {
    id: 'strings',
    label: 'Strings',
    promptPhrase: 'cinematic string section with rich harmonies',
    category: 'strings',
    tags: ['orchestral', 'emotional', 'lush'],
    compatibility: ['piano', 'ambient', 'brass'],
    icon: '🎻',
    energyFit: ['Low', 'Medium'],
  },
  
  // GUITAR
  'guitar': {
    id: 'guitar',
    label: 'Guitar',
    promptPhrase: 'clean guitar lines with warm tone',
    category: 'guitar',
    tags: ['melodic', 'acoustic', 'strumming'],
    compatibility: ['bass', 'drums', 'piano'],
    icon: '🎸',
    energyFit: ['Low', 'Medium', 'High'],
  },
  
  'electric-guitar': {
    id: 'electric-guitar',
    label: 'Electric Guitar',
    promptPhrase: 'electric guitar with smooth sustain',
    category: 'guitar',
    tags: ['rock', 'blues', 'lead'],
    compatibility: ['bass', 'drums'],
    icon: '🎸',
    energyFit: ['Medium', 'High'],
  },
  
  // BRASS & WINDS
  'brass': {
    id: 'brass',
    label: 'Brass Section',
    promptPhrase: 'bright horn section with punchy articulation',
    category: 'brass',
    tags: ['orchestral', 'jazz', 'powerful'],
    compatibility: ['drums', 'bass', 'piano'],
    icon: '🎺',
    energyFit: ['Medium', 'High'],
  },
  
  'saxophone': {
    id: 'saxophone',
    label: 'Saxophone',
    promptPhrase: 'smooth saxophone melody',
    category: 'brass',
    tags: ['jazz', 'solo', 'soulful'],
    compatibility: ['piano', 'bass', 'soft-drums'],
    icon: '🎷',
    energyFit: ['Low', 'Medium'],
  },
  
  // AMBIENT & FX
  'ambient': {
    id: 'ambient',
    label: 'Ambient Textures',
    promptPhrase: 'atmospheric textures and sound design',
    category: 'ambient',
    tags: ['atmospheric', 'background', 'cinematic'],
    compatibility: ['synth', 'strings', 'piano'],
    icon: '🌌',
    energyFit: ['Low', 'Medium'],
  },
  
  // VOCALS
  'vocals': {
    id: 'vocals',
    label: 'Vocals',
    promptPhrase: 'wordless vocal harmonies',
    category: 'vocals',
    tags: ['human', 'melodic', 'emotional'],
    compatibility: ['piano', 'strings', 'ambient'],
    icon: '🎤',
    energyFit: ['Low', 'Medium', 'High'],
  },
};

// Instrument categories
export const INSTRUMENT_CATEGORIES: Record<string, InstrumentCategory> = {
  rhythm: {
    id: 'rhythm',
    label: 'Rhythm & Beats',
    description: 'Drums, percussion, and rhythmic elements',
    icon: '🥁',
    color: '#FF6B6B',
    instruments: ['drums', 'soft-drums'],
    allowMultiple: false,
    required: false,
  },
  
  bass: {
    id: 'bass',
    label: 'Bass',
    description: 'Low-end foundation',
    icon: '🎸',
    color: '#4ECDC4',
    instruments: ['bass', 'synth-bass'],
    allowMultiple: false,
    required: false,
  },
  
  keys: {
    id: 'keys',
    label: 'Keys & Piano',
    description: 'Keyboard instruments and synthesizers',
    icon: '🎹',
    color: '#95E1D3',
    instruments: ['piano', 'electric-piano', 'synth'],
    allowMultiple: true,
    required: false,
  },
  
  strings: {
    id: 'strings',
    label: 'Strings',
    description: 'Orchestral and bowed instruments',
    icon: '🎻',
    color: '#F38181',
    instruments: ['strings'],
    allowMultiple: false,
    required: false,
  },
  
  guitar: {
    id: 'guitar',
    label: 'Guitar',
    description: 'Acoustic and electric guitars',
    icon: '🎸',
    color: '#AA96DA',
    instruments: ['guitar', 'electric-guitar'],
    allowMultiple: false,
    required: false,
  },
  
  brass: {
    id: 'brass',
    label: 'Brass & Winds',
    description: 'Horn sections and wind instruments',
    icon: '🎺',
    color: '#FCBAD3',
    instruments: ['brass', 'saxophone'],
    allowMultiple: true,
    required: false,
  },
  
  ambient: {
    id: 'ambient',
    label: 'Ambient & FX',
    description: 'Atmospheric sounds and textures',
    icon: '🌌',
    color: '#A8D8EA',
    instruments: ['ambient'],
    allowMultiple: true,
    required: false,
  },
  
  vocals: {
    id: 'vocals',
    label: 'Vocals',
    description: 'Human voice elements',
    icon: '🎤',
    color: '#FFD93D',
    instruments: ['vocals'],
    allowMultiple: false,
    required: false,
  },
};

// Preset instrument combinations
export const INSTRUMENT_PRESETS: Record<string, InstrumentPreset> = {
  'lofi-trio': {
    id: 'lofi-trio',
    name: 'Lofi Trio',
    description: 'Classic lofi hip-hop sound',
    instruments: ['soft-drums', 'bass', 'piano'],
    genre: 'lofi-hiphop',
    energy: 'Low',
    vibe: 'relaxed and nostalgic',
    icon: '☕',
    tags: ['beginner-friendly', 'popular', 'study'],
  },
  
  'cinematic-swell': {
    id: 'cinematic-swell',
    name: 'Cinematic Swell',
    description: 'Epic orchestral atmosphere',
    instruments: ['strings', 'brass', 'piano', 'ambient'],
    genre: 'cinematic-orchestral',
    energy: 'Medium',
    vibe: 'dramatic and uplifting',
    icon: '🎬',
    tags: ['emotional', 'film', 'epic'],
  },
  
  'beat-lab': {
    id: 'beat-lab',
    name: 'Beat Lab',
    description: 'Modern electronic production',
    instruments: ['drums', 'synth-bass', 'synth', 'ambient'],
    genre: 'electronic',
    energy: 'High',
    vibe: 'energetic and modern',
    icon: '🎛️',
    tags: ['edm', 'production', 'upbeat'],
  },
  
  'jazz-quartet': {
    id: 'jazz-quartet',
    name: 'Jazz Quartet',
    description: 'Small jazz ensemble',
    instruments: ['soft-drums', 'bass', 'piano', 'saxophone'],
    genre: 'jazz-fusion',
    energy: 'Medium',
    vibe: 'sophisticated and smooth',
    icon: '🎷',
    tags: ['jazz', 'classic', 'elegant'],
  },
  
  'ambient-drift': {
    id: 'ambient-drift',
    name: 'Ambient Drift',
    description: 'Atmospheric soundscape',
    instruments: ['ambient', 'synth', 'strings', 'piano'],
    genre: 'ambient-electronic',
    energy: 'Low',
    vibe: 'ethereal and spacious',
    icon: '🌌',
    tags: ['meditation', 'calm', 'background'],
  },
  
  'indie-band': {
    id: 'indie-band',
    name: 'Indie Band',
    description: 'Full band arrangement',
    instruments: ['drums', 'bass', 'guitar', 'piano'],
    genre: 'indie-rock',
    energy: 'Medium',
    vibe: 'authentic and organic',
    icon: '🎸',
    tags: ['rock', 'band', 'organic'],
  },
};

// Utility functions

/**
 * Get instrument by ID
 */
export function getInstrument(id: string): Instrument | null {
  return INSTRUMENTS[id] || null;
}

/**
 * Get all instruments in a category
 */
export function getInstrumentsByCategory(categoryId: string): Instrument[] {
  const category = INSTRUMENT_CATEGORIES[categoryId];
  if (!category) return [];
  return category.instruments.map(id => INSTRUMENTS[id]).filter(Boolean);
}

/**
 * Get all categories as array
 */
export function getAllCategories(): InstrumentCategory[] {
  return Object.values(INSTRUMENT_CATEGORIES);
}

/**
 * Get all instruments as array
 */
export function getAllInstruments(): Instrument[] {
  return Object.values(INSTRUMENTS);
}

/**
 * Get preset by ID
 */
export function getPreset(presetId: string): InstrumentPreset | null {
  return INSTRUMENT_PRESETS[presetId] || null;
}

/**
 * Get all presets as array
 */
export function getAllPresets(): InstrumentPreset[] {
  return Object.values(INSTRUMENT_PRESETS);
}

/**
 * Check if instrument selection is valid
 */
export function validateInstrumentSelection(selectedIds: string[]): ValidationResult {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'instrumentOptions.ts:validateInstrumentSelection',message:'Function entry',data:{selectedIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  const errors: ValidationError[] = [];
  
  // Check category conflicts (e.g., multiple rhythm instruments)
  const categoryCounts: Record<string, number> = {};
  selectedIds.forEach(id => {
    const instrument = INSTRUMENTS[id];
    if (!instrument) return;
    
    const category = INSTRUMENT_CATEGORIES[instrument.category];
    if (!category) return;
    
    categoryCounts[category.id] = (categoryCounts[category.id] || 0) + 1;
    
    if (!category.allowMultiple && categoryCounts[category.id] > 1) {
      errors.push({
        type: 'category_conflict',
        message: `Only one ${category.label} instrument allowed`,
        category: category.id,
      });
    }
  });
  
  // Minimum selection
  if (selectedIds.length === 0) {
    errors.push({
      type: 'empty_selection',
      message: 'Please select at least one instrument',
    });
  }
  
  // Maximum selection (prevent overly complex arrangements)
  if (selectedIds.length > 6) {
    errors.push({
      type: 'too_many',
      message: 'Maximum 6 instruments recommended for best results',
    });
  }
  
  const result = {
    valid: errors.length === 0,
    errors,
  };
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'instrumentOptions.ts:validateInstrumentSelection',message:'Function exit',data:result,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  return result;
}

/**
 * Get compatibility suggestions based on selected instruments
 */
export function getCompatibleInstruments(selectedIds: string[]): Instrument[] {
  if (selectedIds.length === 0) return [];
  
  // Collect all compatibility arrays
  const compatibilitySets = selectedIds.map(id => {
    const instrument = INSTRUMENTS[id];
    return new Set(instrument?.compatibility || []);
  });
  
  // Find intersection (instruments compatible with ALL selected)
  const intersection = compatibilitySets.reduce((acc, set) => {
    return new Set([...acc].filter(x => set.has(x)));
  });
  
  // Remove already selected instruments
  selectedIds.forEach(id => intersection.delete(id));
  
  return Array.from(intersection)
    .map(id => INSTRUMENTS[id])
    .filter(Boolean);
}

/**
 * Convert selection to MusicGen prompt phrase
 */
export function buildInstrumentPrompt(selectedIds: string[]): string {
  if (selectedIds.length === 0) return '';
  
  const phrases = selectedIds
    .map(id => INSTRUMENTS[id]?.promptPhrase)
    .filter(Boolean);
  
  if (phrases.length === 0) return '';
  if (phrases.length === 1) return phrases[0];
  
  // Join with "with" for natural language
  return phrases.join(' with ');
}

/**
 * Map Gemini's suggested instruments to our IDs
 */
export function mapGeminiInstruments(geminiArray: string[]): string[] {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'instrumentOptions.ts:mapGeminiInstruments',message:'Function entry',data:{geminiArray},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  if (!Array.isArray(geminiArray) || geminiArray.length === 0) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'instrumentOptions.ts:mapGeminiInstruments',message:'Empty input',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return [];
  }
  
  const mapping: Record<string, string> = {
    'drums': 'drums',
    'drum': 'drums',
    'percussion': 'drums',
    'piano': 'piano',
    'bass': 'bass',
    'bass guitar': 'bass',
    'guitar': 'guitar',
    'acoustic guitar': 'guitar',
    'synth': 'synth',
    'synthesizer': 'synth',
    'synthesizers': 'synth',
    'strings': 'strings',
    'string section': 'strings',
    'brass': 'brass',
    'horn': 'brass',
    'horns': 'brass',
    'saxophone': 'saxophone',
    'sax': 'saxophone',
    'ambient': 'ambient',
    'atmospheric': 'ambient',
    'vocals': 'vocals',
    'voice': 'vocals',
    'beats': 'drums',
    'electronic beats': 'drums',
  };
  
  const result = geminiArray
    .map(item => {
      const normalized = item.toLowerCase().trim();
      return mapping[normalized] || null;
    })
    .filter((id): id is string => {
      if (!id) return false;
      // Verify the mapped ID exists in our instruments
      return id in INSTRUMENTS;
    });
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'instrumentOptions.ts:mapGeminiInstruments',message:'Function exit',data:{result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  return result;
}

/**
 * Find matching preset for a set of instrument IDs
 */
export function findMatchingPreset(instrumentIds: string[]): InstrumentPreset | null {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'instrumentOptions.ts:findMatchingPreset',message:'Function entry',data:{instrumentIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  if (instrumentIds.length === 0) return null;
  
  const allPresets = getAllPresets();
  
  for (const preset of allPresets) {
    // Check if arrays have same instruments (order doesn't matter)
    const presetSet = new Set(preset.instruments);
    const inputSet = new Set(instrumentIds);
    
    if (
      presetSet.size === inputSet.size &&
      [...presetSet].every(id => inputSet.has(id))
    ) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'instrumentOptions.ts:findMatchingPreset',message:'Preset matched',data:{presetId:preset.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return preset;
    }
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'instrumentOptions.ts:findMatchingPreset',message:'No preset match',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  return null;
}

