import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: "No authorization code provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!redirect_uri) {
      return new Response(
        JSON.stringify({ error: "No redirect_uri provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "Spotify credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate redirect_uri matches expected pattern (security check)
    const allowedRedirectUris = Deno.env.get("SPOTIFY_ALLOWED_REDIRECT_URIS")?.split(",") || [];
    const isAllowed = allowedRedirectUris.some(allowed => redirect_uri.startsWith(allowed)) || 
                     redirect_uri.startsWith("http://localhost:") ||
                     redirect_uri.startsWith("http://127.0.0.1:");

    if (!isAllowed && allowedRedirectUris.length > 0) {
      console.error("Redirect URI not allowed:", redirect_uri);
      return new Response(
        JSON.stringify({ error: "Invalid redirect_uri" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange authorization code for access token
    // IMPORTANT: redirect_uri must EXACTLY match the one used in the authorization request
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirect_uri, // Use the exact redirect_uri from the auth request
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: await response.text() }));
      console.error("Spotify token exchange error:", JSON.stringify(errorData));
      
      // Return detailed error from Spotify
      return new Response(
        JSON.stringify({ 
          error: errorData.error || "Failed to exchange authorization code",
          error_description: errorData.error_description || "Unknown error occurred"
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in spotify-auth:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

