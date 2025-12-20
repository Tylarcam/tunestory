import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const requestSchema = z.object({
  accessToken: z.string().min(1).max(2000),
  playlistId: z.string().max(100).regex(/^[a-zA-Z0-9]*$/, "Invalid playlist ID format").optional(),
});

interface Track {
  id: string;
  name: string;
  artist: string;
}

interface AudioFeatures {
  energy: number;
  valence: number;
  tempo: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
}

async function getLikedTracks(accessToken: string): Promise<Track[]> {
  const tracks: Track[] = [];
  const url = "https://api.spotify.com/v1/me/tracks?limit=50";

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch liked tracks");
  }

  const data = await response.json();
  for (const item of data.items) {
    if (item.track) {
      tracks.push({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists?.map((a: unknown) => (a as { name: string }).name).join(", ") || "Unknown",
      });
    }
  }

  return tracks;
}

async function getPlaylistTracks(accessToken: string, playlistId: string): Promise<Track[]> {
  const tracks: Track[] = [];
  const url = `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}/tracks?limit=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch playlist tracks");
  }

  const data = await response.json();
  for (const item of data.items) {
    if (item.track) {
      tracks.push({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists?.map((a: unknown) => (a as { name: string }).name).join(", ") || "Unknown",
      });
    }
  }

  return tracks;
}

async function getAudioFeatures(accessToken: string, trackIds: string[]): Promise<AudioFeatures[]> {
  if (trackIds.length === 0) return [];

  const response = await fetch(
    `https://api.spotify.com/v1/audio-features?ids=${trackIds.slice(0, 50).join(",")}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch audio features");
    return [];
  }

  const data = await response.json();
  return data.audio_features?.filter(Boolean) || [];
}

function analyzeFeatures(features: AudioFeatures[]): {
  mood: string;
  energy: string;
  genres: string[];
  description: string;
  searchTerms: string[];
} {
  if (features.length === 0) {
    return {
      mood: "Unknown",
      energy: "Medium",
      genres: ["Mixed"],
      description: "Unable to analyze music vibe.",
      searchTerms: ["indie", "pop", "electronic"],
    };
  }

  // Calculate averages
  const avgEnergy = features.reduce((sum, f) => sum + f.energy, 0) / features.length;
  const avgValence = features.reduce((sum, f) => sum + f.valence, 0) / features.length;
  const avgDanceability = features.reduce((sum, f) => sum + f.danceability, 0) / features.length;
  const avgAcousticness = features.reduce((sum, f) => sum + f.acousticness, 0) / features.length;
  const avgTempo = features.reduce((sum, f) => sum + f.tempo, 0) / features.length;

  // Determine mood based on valence
  let mood: string;
  if (avgValence > 0.7) mood = "Joyful";
  else if (avgValence > 0.5) mood = "Upbeat";
  else if (avgValence > 0.3) mood = "Reflective";
  else mood = "Melancholic";

  // Determine energy level
  let energy: string;
  if (avgEnergy > 0.7) energy = "High";
  else if (avgEnergy > 0.4) energy = "Medium";
  else energy = "Low";

  // Determine genres based on features
  const genres: string[] = [];
  if (avgAcousticness > 0.6) genres.push("Acoustic");
  if (avgDanceability > 0.7) genres.push("Dance");
  if (avgEnergy > 0.7 && avgTempo > 120) genres.push("Electronic");
  if (avgValence < 0.3 && avgEnergy < 0.4) genres.push("Ambient");
  if (avgAcousticness < 0.3 && avgEnergy > 0.6) genres.push("Rock");
  if (genres.length === 0) genres.push("Pop", "Indie");

  // Create description
  const descriptions: Record<string, string> = {
    "Joyful-High": "Your music radiates pure energy and happiness! You're the life of the party.",
    "Joyful-Medium": "You have a sunny disposition that shows in your uplifting music taste.",
    "Joyful-Low": "You appreciate gentle, happy vibes that bring a smile without overwhelming.",
    "Upbeat-High": "Your playlist is all about positive energy and getting things done!",
    "Upbeat-Medium": "You strike a perfect balance between good vibes and relaxation.",
    "Upbeat-Low": "You enjoy chill, positive music that keeps spirits high without the intensity.",
    "Reflective-High": "Intense and thoughtful - your music choices suggest deep emotional intelligence.",
    "Reflective-Medium": "You're a contemplative soul who enjoys music with depth and meaning.",
    "Reflective-Low": "Your taste leans towards peaceful, introspective soundscapes.",
    "Melancholic-High": "Dramatic and emotional - you connect deeply with powerful, moving music.",
    "Melancholic-Medium": "You appreciate the beauty in sadness and find comfort in emotional music.",
    "Melancholic-Low": "Your music taste is moody and atmospheric, perfect for quiet moments.",
  };

  const description = descriptions[`${mood}-${energy}`] || "Your music taste is wonderfully unique!";

  // Generate search terms for recommendations
  const searchTerms = [
    mood.toLowerCase(),
    energy.toLowerCase() + " energy",
    ...genres.slice(0, 2).map(g => g.toLowerCase()),
  ];

  return { mood, energy, genres: genres.slice(0, 3), description, searchTerms };
}

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
        JSON.stringify({ error: "Invalid request parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { accessToken, playlistId } = parseResult.data;

    console.log(`Analyzing music - Source: ${playlistId ? "playlist" : "liked songs"}`);

    // Get tracks
    let tracks: Track[];
    if (playlistId && playlistId !== "liked") {
      tracks = await getPlaylistTracks(accessToken, playlistId);
    } else {
      tracks = await getLikedTracks(accessToken);
    }
    console.log(`Found ${tracks.length} tracks to analyze`);

    if (tracks.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No tracks found in selection",
          mood: "Unknown",
          energy: "Medium",
          genres: ["Mixed"],
          description: "No tracks found to analyze.",
          searchTerms: ["popular", "trending"],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get audio features
    const trackIds = tracks.map(t => t.id);
    const features = await getAudioFeatures(accessToken, trackIds);

    console.log(`Retrieved ${features.length} audio features`);

    // Analyze and return results
    const analysis = analyzeFeatures(features);

    console.log(`Analysis complete: ${analysis.mood} mood, ${analysis.energy} energy`);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-music:", error);
    return new Response(
      JSON.stringify({ error: "Music analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
