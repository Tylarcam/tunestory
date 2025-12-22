/**
 * localStorage utilities for user preferences and presets
 */

export interface UserPreferences {
  defaultGenre: string | null;
  defaultInstruments: string[] | null;
  defaultEnergy: string | null;
  defaultBlendRatio: number | null;
  alwaysShowAdvanced: boolean;
}

export interface Preset {
  id: string;
  name: string;
  genre: string;
  instruments: string[];
  energy: string;
  blendRatio: number;
  vibeTemplate: string;
}

const PREFERENCES_KEY = "tunestory_preferences";
const PRESETS_KEY = "tunestory_presets";

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences | null {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as UserPreferences;
  } catch {
    return null;
  }
}

/**
 * Save user preferences to localStorage
 */
export function setUserPreferences(preferences: UserPreferences): boolean {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get saved presets from localStorage
 */
export function getSavedPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Preset[];
  } catch {
    return [];
  }
}

/**
 * Save presets to localStorage
 */
function setSavedPresets(presets: Preset[]): boolean {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return true;
  } catch {
    return false;
  }
}

/**
 * Add a new preset
 */
export function addPreset(preset: Preset): { success: boolean; presets: Preset[] } {
  const presets = getSavedPresets();
  
  // Check for duplicate IDs
  if (presets.some((p) => p.id === preset.id)) {
    return { success: false, presets };
  }
  
  const updated = [...presets, preset];
  const success = setSavedPresets(updated);
  
  return { success, presets: success ? updated : presets };
}

/**
 * Delete a preset
 */
export function deletePreset(presetId: string): { success: boolean; presets: Preset[] } {
  const presets = getSavedPresets();
  const updated = presets.filter((p) => p.id !== presetId);
  const success = setSavedPresets(updated);
  
  return { success, presets: success ? updated : presets };
}

