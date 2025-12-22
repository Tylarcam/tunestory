/**
 * Preset management utilities
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
 * Create a preset object from a name and state
 */
export function createPresetObject(name: string, state: PresetState): Preset {
  return {
    id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    genre: state.genre,
    instruments: state.instruments,
    energy: state.energy,
    blendRatio: state.blendRatio,
    vibeTemplate: state.vibeTemplate,
  };
}

