/**
 * Enhanced prompt building with user refinements
 * Combines AI analysis with user input according to priority and blend ratio
 */

import { mapGeminiGenreToOption, getGenreLabel } from "./genreOptions";
import { mapGeminiInstruments } from "./instrumentOptions";
import type { UserPreferences } from "./localStorage";

export interface PhotoAnalysis {
  mood: string;
  energy: string | number;
  genres: string[];
  description?: string;
  tempo_bpm?: number;
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

export interface UserRefinements {
  selectedGenre: string | null;
  selectedInstruments: string[];
  energyLevel: string | null;
  blendRatio: number;
  userVibeText: string;
}

export interface RefinedAnalysis {
  mood: string;
  energy: string | number;
  genres: string[];
  description: string;
  tempo_bpm?: number;
  setting?: string;
  time_of_day?: string;
  visualElements: {
    colors?: string[];
    instruments: string[];
    setting?: string;
    timeOfDay?: string;
    atmosphere?: string;
  };
}

/**
 * Get the final genre using priority: user selection > preferences > AI
 */
function getFinalGenre(
  userGenre: string | null,
  preferences: UserPreferences | null,
  aiGenres: string[]
): string {
  // Priority 1: User manual selection
  if (userGenre) {
    return getGenreLabel(userGenre);
  }

  // Priority 2: User saved preference
  if (preferences?.defaultGenre) {
    return getGenreLabel(preferences.defaultGenre);
  }

  // Priority 3: AI suggestion (map first genre to our options)
  if (aiGenres.length > 0) {
    return getGenreLabel(mapGeminiGenreToOption(aiGenres[0]));
  }

  // Fallback
  return "ambient electronic";
}

/**
 * Get the final instruments using priority: user selection > preferences > AI > genre defaults
 */
function getFinalInstruments(
  userInstruments: string[],
  preferences: UserPreferences | null,
  aiInstruments: string[] | undefined,
  genre: string
): string[] {
  // Priority 1: User manual selection
  if (userInstruments.length > 0) {
    return userInstruments;
  }

  // Priority 2: User saved preference
  if (preferences?.defaultInstruments && preferences.defaultInstruments.length > 0) {
    return preferences.defaultInstruments;
  }

  // Priority 3: AI suggestion (map Gemini instruments to our IDs)
  if (aiInstruments && aiInstruments.length > 0) {
    const mappedInstruments = mapGeminiInstruments(aiInstruments);
    return mappedInstruments.slice(0, 3);
  }

  // Priority 4: Genre defaults
  return getDefaultInstrumentsForGenre(genre);
}

/**
 * Get default instruments for a genre
 */
function getDefaultInstrumentsForGenre(genre: string): string[] {
  const lowerGenre = genre.toLowerCase();
  
  if (lowerGenre.includes("piano") || lowerGenre.includes("classical")) {
    return ["piano"];
  }
  if (lowerGenre.includes("jazz")) {
    return ["piano", "bass", "drums"];
  }
  if (lowerGenre.includes("electronic") || lowerGenre.includes("synth")) {
    return ["synth", "bass", "drums"];
  }
  if (lowerGenre.includes("rock") || lowerGenre.includes("indie")) {
    return ["guitar", "bass", "drums"];
  }
  if (lowerGenre.includes("hip-hop") || lowerGenre.includes("trap")) {
    return ["bass", "drums"];
  }
  if (lowerGenre.includes("folk") || lowerGenre.includes("acoustic")) {
    return ["guitar", "piano"];
  }

  // Default
  return ["piano", "bass", "drums"];
}

/**
 * Get the final energy using priority: user selection > preferences > AI
 */
function getFinalEnergy(
  userEnergy: string | null,
  preferences: UserPreferences | null,
  aiEnergy: string | number
): string {
  // Priority 1: User manual selection
  if (userEnergy) {
    return userEnergy;
  }

  // Priority 2: User saved preference
  if (preferences?.defaultEnergy) {
    return preferences.defaultEnergy;
  }

  // Priority 3: AI analysis
  if (typeof aiEnergy === "string") {
    return aiEnergy;
  }

  // Convert number to string
  if (aiEnergy >= 7) return "High";
  if (aiEnergy >= 4) return "Medium";
  return "Low";
}

/**
 * Get the final blend ratio using priority: user slider > preferences > default
 */
function getFinalBlendRatio(
  userBlendRatio: number,
  preferences: UserPreferences | null
): number {
  // Priority 1: User manual adjustment
  if (userBlendRatio !== 30) {
    return userBlendRatio;
  }

  // Priority 2: User saved preference
  if (preferences?.defaultBlendRatio !== null) {
    return preferences.defaultBlendRatio;
  }

  // Default
  return 30;
}

/**
 * Blend user vibe text with AI description based on blend ratio
 */
function blendVibeText(
  userText: string,
  aiDescription: string | undefined,
  blendRatio: number
): string {
  if (!userText && !aiDescription) {
    return "";
  }

  if (!userText) {
    return aiDescription || "";
  }

  if (!aiDescription) {
    return userText;
  }

  // Blend ratio: 0% = all AI, 100% = all user
  // For now, we'll use a simple approach: if ratio > 50%, prioritize user text
  // In a more sophisticated implementation, we could blend the actual text
  if (blendRatio >= 50) {
    return userText;
  } else if (blendRatio <= 10) {
    return aiDescription;
  } else {
    // Mix both
    return `${userText}. ${aiDescription}`;
  }
}

/**
 * Build a refined analysis object from photo analysis, user refinements, and preferences
 */
export function buildRefinedAnalysis(
  photoAnalysis: PhotoAnalysis,
  userRefinements: UserRefinements,
  userPreferences: UserPreferences | null
): RefinedAnalysis {
  const finalGenre = getFinalGenre(
    userRefinements.selectedGenre,
    userPreferences,
    photoAnalysis.genres
  );

  const finalInstruments = getFinalInstruments(
    userRefinements.selectedInstruments,
    userPreferences,
    photoAnalysis.visualElements?.instruments,
    finalGenre
  );

  const finalEnergy = getFinalEnergy(
    userRefinements.energyLevel,
    userPreferences,
    photoAnalysis.energy
  );

  const finalBlendRatio = getFinalBlendRatio(
    userRefinements.blendRatio,
    userPreferences
  );

  const blendedDescription = blendVibeText(
    userRefinements.userVibeText,
    photoAnalysis.description,
    finalBlendRatio
  );

  return {
    mood: photoAnalysis.mood, // Keep AI mood for now
    energy: finalEnergy,
    genres: [finalGenre], // Use selected genre as primary
    description: blendedDescription || photoAnalysis.description || "",
    tempo_bpm: photoAnalysis.tempo_bpm,
    setting: photoAnalysis.setting || photoAnalysis.visualElements?.setting,
    time_of_day: photoAnalysis.time_of_day || photoAnalysis.visualElements?.timeOfDay,
    visualElements: {
      colors: photoAnalysis.visualElements?.colors,
      instruments: finalInstruments,
      setting: photoAnalysis.visualElements?.setting,
      timeOfDay: photoAnalysis.visualElements?.timeOfDay,
      atmosphere: photoAnalysis.visualElements?.atmosphere,
    },
  };
}

