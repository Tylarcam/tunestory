/**
 * localStorage utilities for user preferences and presets
 * Handles persistence with error handling
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
  createdAt?: number;
}

const PREFERENCES_KEY = "tunestory_user_preferences";
const PRESETS_KEY = "tunestory_saved_presets";
const VERSION_KEY = "tunestory_storage_version";
const CURRENT_VERSION = "1.0";

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    
    // Check version and migrate if needed
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }

    return parsed as UserPreferences;
  } catch (error) {
    console.error("Failed to read user preferences:", error);
    return null;
  }
}

/**
 * Save user preferences to localStorage
 */
export function setUserPreferences(preferences: UserPreferences): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded");
      return false;
    }
    console.error("Failed to save user preferences:", error);
    return false;
  }
}

/**
 * Clear user preferences
 */
export function clearUserPreferences(): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.removeItem(PREFERENCES_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear user preferences:", error);
    return false;
  }
}

/**
 * Get saved presets from localStorage
 */
export function getSavedPresets(): Preset[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as Preset[]) : [];
  } catch (error) {
    console.error("Failed to read saved presets:", error);
    return [];
  }
}

/**
 * Save presets array to localStorage
 */
export function setSavedPresets(presets: Preset[]): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded");
      return false;
    }
    console.error("Failed to save presets:", error);
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
 * Delete a preset by ID
 */
export function deletePreset(presetId: string): { success: boolean; presets: Preset[] } {
  const presets = getSavedPresets();
  const updated = presets.filter((p) => p.id !== presetId);
  const success = setSavedPresets(updated);
  
  return { success, presets: success ? updated : presets };
}

/**
 * Update a preset
 */
export function updatePreset(
  presetId: string,
  updates: Partial<Preset>
): { success: boolean; presets: Preset[] } {
  const presets = getSavedPresets();
  const updated = presets.map((p) => (p.id === presetId ? { ...p, ...updates } : p));
  const success = setSavedPresets(updated);
  return { success, presets: success ? updated : presets };
}

/**
 * Generate a unique preset ID
 */
export function generatePresetId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
