import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const requestSchema = z.object({
  imageBase64: z.string()
    .min(1, "Image data is required")
    .max(10 * 1024 * 1024, "Image too large (max 10MB)")
    .refine(
      (val) => val.startsWith("data:image/"),
      "Invalid image format - must be a base64 data URL"
    ),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.issues);
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parseResult.error.issues[0]?.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64 } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing image with Gemini...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert music mood analyzer for Spotify. Analyze images and extract detailed musical characteristics that will help find matching songs.

Analyze the image for:
1. Emotional mood (joyful, melancholic, energetic, calm, etc.)
2. Energy level (Low, Medium, High)
3. Visual elements: colors (warm/cool, bright/dark), setting (beach, city, nature, etc.), time of day
4. Overall atmosphere and vibe

IMPORTANT - Generate Spotify search terms that will work well with Spotify's search API. Good search terms:
- Combine mood + genre: "chill indie pop", "energetic electronic dance"
- Include descriptive music terms: "ambient atmospheric", "upbeat tropical house"
- Use music-specific descriptors: "synthwave retro", "acoustic folk", "lo-fi hip hop"
- Consider the visual elements: beach scenes → "tropical" or "island vibes", night scenes → "nocturnal" or "dark ambient"
- Be specific but searchable: "indie rock summer vibes" is better than just "happy"

Always respond with a JSON object in this exact format:
{
  "mood": "single word or short phrase describing the primary mood (e.g., 'joyful', 'melancholic', 'energetic', 'peaceful')",
  "energy": "Low", "Medium", or "High",
  "genres": ["genre1", "genre2", "genre3"],
  "description": "A poetic one-sentence description of the vibe",
  "searchTerms": ["search term 1", "search term 2", "search term 3", "search term 4"],
  "visualElements": {
    "colors": ["color1", "color2"],
    "setting": "setting description",
    "timeOfDay": "morning/afternoon/evening/night/unknown",
    "atmosphere": "atmospheric description"
  }
}

Generate 4 searchTerms minimum. Each should be a complete Spotify-searchable query (2-5 words) that combines mood, genre, and characteristics. Examples:
- "chill indie acoustic"
- "energetic electronic dance"
- "melancholic piano ballad"
- "upbeat tropical house"
- "dark ambient atmospheric"
- "warm folk indie"
- "vibrant synthwave retro"`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and tell me what music would match its vibe. Respond only with the JSON object."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("Raw AI response received");

    // Parse the JSON from the response
    let analysis;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response");
      // Return a fallback analysis
      analysis = {
        mood: "Atmospheric",
        energy: "Medium",
        genres: ["Indie", "Alternative", "Electronic"],
        description: "A moment captured in time, filled with possibility.",
        searchTerms: ["chill indie vibes", "ambient electronic", "atmospheric alternative", "mellow indie pop"],
        visualElements: {
          colors: [],
          setting: "unknown",
          timeOfDay: "unknown",
          atmosphere: "neutral"
        }
      };
    }

    console.log("Analysis complete");

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-image:", error);
    return new Response(
      JSON.stringify({ error: "Request processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
