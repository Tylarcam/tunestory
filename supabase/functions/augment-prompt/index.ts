import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  currentPrompt: z.string().min(1).max(500),
  direction: z.string().min(1).max(200),
  context: z.object({
    genre: z.string().optional(),
    mood: z.string().optional(),
    energy: z.string().optional(),
    instruments: z.array(z.string()).optional(),
  }).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request parameters",
          details: parseResult.error.issues[0]?.message,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { currentPrompt, direction, context } = parseResult.data;

    // Get Gemini API key
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Build context string for better prompt rewriting
    const contextStr = context
      ? `Context: Genre: ${context.genre || "not specified"}, Mood: ${context.mood || "not specified"}, Energy: ${context.energy || "not specified"}, Instruments: ${context.instruments?.join(", ") || "not specified"}`
      : "";

    // Create prompt for Gemini to rewrite
    const systemPrompt = `You are a music prompt engineering expert. Your task is to rewrite music generation prompts following AudioCraft MusicGen best practices:

1. Keep prompts 10-25 words
2. Use specific musical descriptors (era, genre, mood, tempo, instruments)
3. Include production style (lo-fi, polished, cinematic, etc.)
4. Specify vocal type if relevant
5. Use concrete terms, not abstract concepts
6. Follow this structure: [Era/genre] [mood/context] with [instrumentation/arrangement], [production style], [vocal type], [energy], [quality]

Current prompt: "${currentPrompt}"
${contextStr}

User direction: "${direction}"

Rewrite the prompt following the user's direction while maintaining AudioCraft best practices. Return ONLY the rewritten prompt, nothing else.`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const augmentedPrompt =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || currentPrompt;

    // Validate prompt length
    const wordCount = augmentedPrompt.split(/\s+/).filter(Boolean).length;
    if (wordCount < 5 || wordCount > 50) {
      console.warn(`Augmented prompt word count (${wordCount}) is outside recommended range`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        augmentedPrompt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Augment prompt error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to augment prompt",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

