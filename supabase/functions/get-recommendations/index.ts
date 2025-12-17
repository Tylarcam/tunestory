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
    const { searchTerms, genres, mood, energy, visualElements } = await req.json();

    console.log("Getting recommendations for:", { searchTerms, genres, mood, energy, visualElements });

    const token = await getSpotifyToken();
    
    // Build search queries from different inputs with multiple strategies
    const queries: string[] = [];
    
    // Strategy 1: Use provided searchTerms (highest priority - these are optimized for Spotify)
    if (searchTerms && Array.isArray(searchTerms) && searchTerms.length > 0) {
      // Use up to 4 search terms
      queries.push(...searchTerms.slice(0, 4).filter(term => term && term.trim().length > 0));
    }
    
    // Strategy 2: Combine mood + genre (more specific)
    if (genres && Array.isArray(genres) && genres.length > 0 && mood) {
      genres.slice(0, 2).forEach(genre => {
        const query = `${mood.toLowerCase()} ${genre.toLowerCase()}`.trim();
        if (query.length > 0) {
          queries.push(query);
        }
      });
    }
    
    // Strategy 3: Energy + genre combinations
    if (genres && Array.isArray(genres) && genres.length > 0 && energy) {
      genres.slice(0, 2).forEach(genre => {
        const energyLower = energy.toLowerCase();
        queries.push(`${energyLower} ${genre.toLowerCase()}`);
      });
    }
    
    // Strategy 4: Visual element-based searches (if available)
    if (visualElements) {
      if (visualElements.setting) {
        queries.push(`${visualElements.setting} vibes`);
      }
      if (visualElements.atmosphere) {
        queries.push(`${visualElements.atmosphere} music`);
      }
    }
    
    // Strategy 5: Mood + energy combination (fallback)
    if (mood && energy) {
      queries.push(`${mood.toLowerCase()} ${energy.toLowerCase()} music`);
    }
    
    // Strategy 6: Genre-only fallbacks (if we don't have enough queries)
    if (queries.length < 3 && genres && Array.isArray(genres) && genres.length > 0) {
      genres.slice(0, 2).forEach(genre => {
        queries.push(genre.toLowerCase());
      });
    }

    // Remove duplicates and empty queries
    const uniqueQueries = [...new Set(queries.filter(q => q && q.trim().length > 0))];
    
    // Ensure we have at least 3 queries
    if (uniqueQueries.length === 0) {
      // Ultimate fallback
      uniqueQueries.push("popular music", "trending", "top hits");
    }

    console.log("Search queries to execute:", uniqueQueries);

    // Search for tracks using multiple queries
    const allTracks: SpotifyTrack[] = [];
    const seenIds = new Set<string>();
    const queryResults: { query: string; count: number }[] = [];

    for (const query of uniqueQueries) {
      try {
        const tracks = await searchTracks(token, query, 5);
        queryResults.push({ query, count: tracks.length });
        
        for (const track of tracks) {
          if (!seenIds.has(track.id)) {
            seenIds.add(track.id);
            allTracks.push(track);
          }
        }
        
        // If we have enough tracks, we can stop early
        if (allTracks.length >= 10) {
          console.log(`Early stop: Found ${allTracks.length} tracks`);
          break;
        }
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
        // Continue with other queries even if one fails
      }
    }

    console.log("Query results summary:", queryResults);
    console.log(`Total unique tracks found: ${allTracks.length}`);

    // Take the top 5 unique tracks (prioritize tracks from earlier queries)
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
