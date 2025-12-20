import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed redirect URI patterns
const ALLOWED_REDIRECT_PATTERNS = [
  /^https:\/\/[a-zA-Z0-9-]+\.lovableproject\.com\/callback$/,
  /^https:\/\/[a-zA-Z0-9-]+\.lovable\.app\/callback$/,
  /^https:\/\/[a-zA-Z0-9-]+--[a-zA-Z0-9-]+\.lovable\.app\/callback$/,
  /^http:\/\/localhost:\d+\/callback$/,
];

function isValidRedirectUri(uri: string): boolean {
  return ALLOWED_REDIRECT_PATTERNS.some(pattern => pattern.test(uri));
}

// Input validation schema
const requestSchema = z.object({
  code: z.string().min(1).max(2000),
  redirect_uri: z.string().min(1).max(500).url(),
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
        JSON.stringify({ error: "Invalid request parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { code, redirect_uri } = parseResult.data;

    // Validate redirect_uri against allowlist
    if (!isValidRedirectUri(redirect_uri)) {
      console.error("Invalid redirect_uri:", redirect_uri);
      return new Response(
        JSON.stringify({ error: "Invalid redirect URI" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      console.error("Missing Spotify credentials");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Exchanging code for token");

    // Exchange authorization code for access token
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirect_uri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Spotify token exchange error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to exchange authorization code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    console.log("Token exchange successful");

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
    return new Response(
      JSON.stringify({ error: "Authentication failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
