import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AudioFeatures {
  danceability: number;
  energy: number;
  valence: number; // Positivity/happiness (0-1)
  tempo: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
}

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
  external_urls: { spotify: string };
}

async function getLikedTracks(accessToken: string, limit = 50): Promise<Track[]> {
  const tracks: Track[] = [];
  let url = `https://api.spotify.com/v1/me/tracks?limit=${limit}`;

  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch liked tracks");
    }

    const data = await response.json();
    tracks.push(...data.items.map((item: { track: Track }) => item.track));
    url = data.next;
  }

  return tracks;
}

async function getPlaylistTracks(accessToken: string, playlistId: string): Promise<Track[]> {
  const tracks: Track[] = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;

  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch playlist tracks");
    }

    const data = await response.json();
    tracks.push(...data.items.map((item: { track: Track | null }) => item.track).filter(Boolean));
    url = data.next;
  }

  return tracks;
}

async function getAudioFeatures(accessToken: string, trackIds: string[]): Promise<AudioFeatures[]> {
  // Spotify API allows max 100 IDs per request
  const chunks: string[][] = [];
  for (let i = 0; i < trackIds.length; i += 100) {
    chunks.push(trackIds.slice(i, i + 100));
  }

  const allFeatures: AudioFeatures[] = [];

  for (const chunk of chunks) {
    const response = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${chunk.join(",")}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch audio features");
      continue;
    }

    const data = await response.json();
    allFeatures.push(...(data.audio_features.filter(Boolean) as AudioFeatures[]));
  }

  return allFeatures;
}

function analyzeVibe(features: AudioFeatures[]): {
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
  const avgTempo = features.reduce((sum, f) => sum + f.tempo, 0) / features.length;
  const avgDanceability = features.reduce((sum, f) => sum + f.danceability, 0) / features.length;
  const avgAcousticness = features.reduce((sum, f) => sum + f.acousticness, 0) / features.length;
  const avgInstrumentalness = features.reduce((sum, f) => sum + f.instrumentalness, 0) / features.length;

  // Determine mood based on valence (happiness)
  let mood: string;
  if (avgValence > 0.7) {
    mood = "Joyful";
  } else if (avgValence > 0.5) {
    mood = "Upbeat";
  } else if (avgValence > 0.3) {
    mood = "Melancholic";
  } else {
    mood = "Somber";
  }

  // Determine energy level
  let energy: string;
  if (avgEnergy > 0.7) {
    energy = "High";
  } else if (avgEnergy > 0.4) {
    energy = "Medium";
  } else {
    energy = "Low";
  }

  // Determine genres based on characteristics
  const genres: string[] = [];
  if (avgAcousticness > 0.5) {
    genres.push("Acoustic", "Folk");
  }
  if (avgInstrumentalness > 0.5) {
    genres.push("Instrumental", "Ambient");
  }
  if (avgDanceability > 0.6) {
    genres.push("Dance", "Pop");
  }
  if (avgTempo > 120) {
    genres.push("Electronic", "EDM");
  }
  if (avgTempo < 90) {
    genres.push("Ballad", "Slow");
  }
  if (genres.length === 0) {
    genres.push("Indie", "Alternative", "Rock");
  }

  // Create description
  const descriptions = [
    `${mood.toLowerCase()} ${energy.toLowerCase()} energy`,
    `${genres.slice(0, 2).join(" and ")} vibes`,
    avgTempo > 120 ? "upbeat tempo" : avgTempo < 90 ? "relaxed pace" : "moderate rhythm",
  ];
  const description = `A ${descriptions.join(", ")} collection that captures your musical essence.`;

  // Generate search terms
  const searchTerms = [
    `${mood.toLowerCase()} ${genres[0]?.toLowerCase() || "music"}`,
    `${energy.toLowerCase()} energy ${genres[0]?.toLowerCase() || "vibes"}`,
    `${mood.toLowerCase()} ${avgTempo > 120 ? "upbeat" : avgTempo < 90 ? "chill" : "moderate"}`,
  ];

  return {
    mood,
    energy,
    genres: genres.slice(0, 3),
    description,
    searchTerms,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken, playlistId } = await req.json();

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "No access token provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch tracks
    let tracks: Track[];
    if (playlistId === "liked") {
      tracks = await getLikedTracks(accessToken, 50);
    } else {
      tracks = await getPlaylistTracks(accessToken, playlistId);
    }

    if (tracks.length === 0) {
      return new Response(
        JSON.stringify({ error: "No tracks found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get track IDs (limit to 50 for analysis)
    const trackIds = tracks.slice(0, 50).map((t) => t.id);

    // Get audio features
    const features = await getAudioFeatures(accessToken, trackIds);

    if (features.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to analyze audio features" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze vibe
    const analysis = analyzeVibe(features);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-music:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

