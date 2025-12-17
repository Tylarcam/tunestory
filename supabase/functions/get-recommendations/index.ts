import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
  external_urls: { spotify: string };
}

async function getSpotifyToken(): Promise<string> {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Spotify auth error:", error);
    throw new Error("Failed to authenticate with Spotify");
  }

  const data = await response.json();
  return data.access_token;
}

async function searchTracks(token: string, query: string, limit = 5): Promise<SpotifyTrack[]> {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Spotify search error:", error);
    return [];
  }

  const data = await response.json();
  return data.tracks?.items || [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerms, genres, mood, energy } = await req.json();

    console.log("Getting recommendations for:", { searchTerms, genres, mood, energy });

    const token = await getSpotifyToken();
    
    // Build search queries from different inputs
    const queries: string[] = [];
    
    if (searchTerms && searchTerms.length > 0) {
      queries.push(...searchTerms.slice(0, 3));
    }
    
    // Add genre-based queries
    if (genres && genres.length > 0) {
      queries.push(`${mood} ${genres[0]}`);
    }
    
    // Add mood + energy based query
    queries.push(`${mood} ${energy} vibes`);

    console.log("Search queries:", queries);

    // Search for tracks using multiple queries
    const allTracks: SpotifyTrack[] = [];
    const seenIds = new Set<string>();

    for (const query of queries) {
      const tracks = await searchTracks(token, query, 3);
      for (const track of tracks) {
        if (!seenIds.has(track.id)) {
          seenIds.add(track.id);
          allTracks.push(track);
        }
      }
    }

    // Take the top 5 unique tracks
    const topTracks = allTracks.slice(0, 5);

    console.log(`Found ${topTracks.length} tracks`);

    // Format the response
    const recommendations = topTracks.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || "",
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      genre: genres?.[0] || "Mixed",
    }));

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
