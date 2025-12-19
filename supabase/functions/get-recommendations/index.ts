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

interface PlaylistTrack {
  track: SpotifyTrack | null;
}

// iTunes API fallback for preview URLs
async function getItunesPreview(trackName: string, artistName: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${trackName} ${artistName}`);
    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&limit=1`
    );
    
    if (!response.ok) {
      console.log(`iTunes search failed for "${trackName}"`);
      return null;
    }
    
    const data = await response.json();
    const previewUrl = data.results?.[0]?.previewUrl || null;
    
    if (previewUrl) {
      console.log(`Found iTunes preview for "${trackName}"`);
    }
    
    return previewUrl;
  } catch (error) {
    console.error(`iTunes lookup error for "${trackName}":`, error);
    return null;
  }
}

// Get preview URL with iTunes fallback
async function getPreviewUrl(track: SpotifyTrack): Promise<string | null> {
  // First try Spotify's preview URL
  if (track.preview_url) {
    return track.preview_url;
  }
  
  // Fallback to iTunes
  const artistName = track.artists[0]?.name || "";
  return await getItunesPreview(track.name, artistName);
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

async function getUserLikedSongs(userToken: string, limit = 50): Promise<SpotifyTrack[]> {
  const allTracks: SpotifyTrack[] = [];
  let nextUrl: string | null = `https://api.spotify.com/v1/me/tracks?limit=${limit}`;
  
  // Fetch up to 200 tracks (4 pages)
  let pageCount = 0;
  while (nextUrl && pageCount < 4) {
    const response: Response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      console.error("Error fetching liked songs:", await response.text());
      break;
    }

    const data: { items: { track: SpotifyTrack }[]; next: string | null } = await response.json();
    const tracks = data.items
      .map((item) => item.track)
      .filter((track): track is SpotifyTrack => track !== null);
    allTracks.push(...tracks);
    nextUrl = data.next;
    pageCount++;
  }

  console.log(`Fetched ${allTracks.length} liked songs`);
  return allTracks;
}

async function getPlaylistTracks(userToken: string, playlistId: string, limit = 50): Promise<SpotifyTrack[]> {
  const allTracks: SpotifyTrack[] = [];
  let nextUrl: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`;
  
  // Fetch up to 200 tracks (4 pages)
  let pageCount = 0;
  while (nextUrl && pageCount < 4) {
    const response: Response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      console.error("Error fetching playlist tracks:", await response.text());
      break;
    }

    const data: { items: PlaylistTrack[]; next: string | null } = await response.json();
    const tracks = data.items
      .map((item) => item.track)
      .filter((track): track is SpotifyTrack => track !== null);
    allTracks.push(...tracks);
    nextUrl = data.next;
    pageCount++;
  }

  console.log(`Fetched ${allTracks.length} playlist tracks`);
  return allTracks;
}

function scoreTrackRelevance(
  track: SpotifyTrack,
  searchTerms: string[],
  mood: string,
  genres: string[]
): number {
  let score = 0;
  const trackName = track.name.toLowerCase();
  const artistNames = track.artists.map(a => a.name.toLowerCase()).join(" ");
  const albumName = track.album.name.toLowerCase();
  const fullText = `${trackName} ${artistNames} ${albumName}`;

  // Check search terms
  for (const term of searchTerms) {
    const termLower = term.toLowerCase();
    if (fullText.includes(termLower)) {
      score += 10;
    }
    // Partial match
    const words = termLower.split(" ");
    for (const word of words) {
      if (word.length > 3 && fullText.includes(word)) {
        score += 3;
      }
    }
  }

  // Check mood in track/album name
  if (mood && fullText.includes(mood.toLowerCase())) {
    score += 5;
  }

  // Check genres
  for (const genre of genres) {
    if (fullText.includes(genre.toLowerCase())) {
      score += 5;
    }
  }

  // Add randomness to prevent always showing same tracks
  score += Math.random() * 5;

  return score;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      searchTerms, 
      genres, 
      mood, 
      energy, 
      visualElements,
      // New parameters for user library mode
      spotifyAccessToken,
      playlistId,
      useUserLibrary
    } = await req.json();

    console.log("Getting recommendations for:", { 
      searchTerms, 
      genres, 
      mood, 
      energy, 
      useUserLibrary, 
      hasPlaylistId: !!playlistId 
    });

    // If using user's library, filter their tracks instead of searching
    if (useUserLibrary && spotifyAccessToken) {
      console.log("Using user library mode");
      
      let userTracks: SpotifyTrack[];
      
      if (playlistId) {
        userTracks = await getPlaylistTracks(spotifyAccessToken, playlistId);
      } else {
        userTracks = await getUserLikedSongs(spotifyAccessToken);
      }

      if (userTracks.length === 0) {
        return new Response(
          JSON.stringify({ 
            recommendations: [],
            message: "No tracks found in your library" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Score and sort tracks by relevance to mood/genres
      const scoredTracks = userTracks.map(track => ({
        track,
        score: scoreTrackRelevance(track, searchTerms || [], mood || "", genres || [])
      }));

      scoredTracks.sort((a, b) => b.score - a.score);

      // Take top 5 most relevant tracks
      const topTracks = scoredTracks.slice(0, 5).map(st => st.track);

      console.log(`Selected ${topTracks.length} tracks from user library`);

      // Get preview URLs with iTunes fallback for tracks missing Spotify previews
      const recommendations = await Promise.all(
        topTracks.map(async (track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists.map((a) => a.name).join(", "),
          album: track.album.name,
          albumArt: track.album.images[0]?.url || "",
          previewUrl: await getPreviewUrl(track),
          spotifyUrl: track.external_urls.spotify,
          genre: genres?.[0] || "From Your Library",
        }))
      );

      return new Response(
        JSON.stringify({ recommendations }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default behavior: search Spotify catalog
    const token = await getSpotifyToken();
    
    // Build search queries from different inputs with multiple strategies
    const queries: string[] = [];
    
    // Strategy 1: Use provided searchTerms (highest priority - these are optimized for Spotify)
    if (searchTerms && Array.isArray(searchTerms) && searchTerms.length > 0) {
      queries.push(...searchTerms.slice(0, 4).filter((term: string) => term && term.trim().length > 0));
    }
    
    // Strategy 2: Combine mood + genre (more specific)
    if (genres && Array.isArray(genres) && genres.length > 0 && mood) {
      genres.slice(0, 2).forEach((genre: string) => {
        const query = `${mood.toLowerCase()} ${genre.toLowerCase()}`.trim();
        if (query.length > 0) {
          queries.push(query);
        }
      });
    }
    
    // Strategy 3: Energy + genre combinations
    if (genres && Array.isArray(genres) && genres.length > 0 && energy) {
      genres.slice(0, 2).forEach((genre: string) => {
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
      genres.slice(0, 2).forEach((genre: string) => {
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

    // Format the response with iTunes fallback for missing previews
    const recommendations = await Promise.all(
      topTracks.map(async (track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        albumArt: track.album.images[0]?.url || "",
        previewUrl: await getPreviewUrl(track),
        spotifyUrl: track.external_urls.spotify,
        genre: genres?.[0] || "Mixed",
      }))
    );

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
