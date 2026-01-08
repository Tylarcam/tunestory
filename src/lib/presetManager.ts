/**
 * Preset validation and management utilities
 */

import type { Preset } from "./localStorage";

export interface PresetState {
  genre: string;
  instruments: string[];
  energy: string;
  blendRatio: number;
  vibeTemplate: string;
}

/**
 * Validate preset name
 */
export function validatePresetName(
  name: string,
  existingPresets: Preset[]
): { valid: boolean; error: string | null } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Preset name is required" };
  }

  if (name.length > 50) {
    return { valid: false, error: "Preset name must be 50 characters or less" };
  }

  const trimmed = name.trim();
  const duplicate = existingPresets.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());

  if (duplicate) {
    return { valid: false, error: "A preset with this name already exists" };
  }

  return { valid: true, error: null };
}

/**
 * Compare current state to a preset
 */
export function comparePresetToState(
  preset: Preset,
  currentState: PresetState
): boolean {
  return (
    preset.genre === currentState.genre &&
    JSON.stringify(preset.instruments.sort()) === JSON.stringify(currentState.instruments.sort()) &&
    preset.energy === currentState.energy &&
    preset.blendRatio === currentState.blendRatio &&
    preset.vibeTemplate === currentState.vibeTemplate
  );
}

/**
 * Create a preset object from current state
 */
export function createPresetObject(
  name: string,
  currentState: PresetState,
  presetId?: string
): Preset {
  return {
    id: presetId || `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    genre: currentState.genre,
    instruments: [...currentState.instruments],
    energy: currentState.energy,
    blendRatio: currentState.blendRatio,
    vibeTemplate: currentState.vibeTemplate,
    createdAt: Date.now(),
  };
}
