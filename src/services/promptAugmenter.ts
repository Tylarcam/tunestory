/**
 * Prompt augmentation service
 * Uses AI to rewrite prompts based on user direction
 */

export interface AugmentPromptRequest {
  currentPrompt: string;
  direction: string; // User's direction (e.g., "make it more cinematic", "add more energy")
  context?: {
    genre?: string;
    mood?: string;
    energy?: string;
    instruments?: string[];
  };
}

export interface AugmentPromptResponse {
  success: boolean;
  augmentedPrompt?: string;
  error?: string;
}

/**
 * Augment a prompt using AI
 */
export async function augmentPrompt(
  request: AugmentPromptRequest
): Promise<AugmentPromptResponse> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/augment-prompt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP ${response.status} error`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Prompt augmentation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to augment prompt",
    };
  }
}

