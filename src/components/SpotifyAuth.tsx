import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SpotifyUser {
  id: string;
  display_name: string;
  images?: { url: string }[];
}

interface SpotifyAuthProps {
  onAuthChange: (accessToken: string | null) => void;
}

export function SpotifyAuth({ onAuthChange }: SpotifyAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Get redirect URI - must be consistent
  const getRedirectUri = () => {
    // Use environment variable if set, otherwise use current origin
    const envRedirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    if (envRedirectUri) {
      return envRedirectUri;
    }
    // Fallback to current origin + pathname (must match Spotify app settings)
    return `${window.location.origin}${window.location.pathname}`;
  };

  // Check for existing auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_access_token");
    const storedExpiry = localStorage.getItem("spotify_token_expiry");
    
    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      if (Date.now() < expiryTime) {
        setAccessToken(storedToken);
        setIsAuthenticated(true);
        onAuthChange(storedToken);
        fetchUserProfile(storedToken);
      } else {
        // Token expired, clear it
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_token_expiry");
        localStorage.removeItem("spotify_refresh_token");
      }
    }

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");
    const state = urlParams.get("state");
    const storedState = sessionStorage.getItem("spotify_oauth_state");

    // Verify state parameter to prevent CSRF
    if (code && state !== storedState) {
      toast({
        title: "Authentication failed",
        description: "Security validation failed. Please try again.",
        variant: "destructive",
      });
      sessionStorage.removeItem("spotify_oauth_state");
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (error) {
      const errorDescription = urlParams.get("error_description") || "Could not connect to Spotify.";
      toast({
        title: "Authentication failed",
        description: errorDescription,
        variant: "destructive",
      });
      sessionStorage.removeItem("spotify_oauth_state");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code) {
      // Clean up state before processing
      sessionStorage.removeItem("spotify_oauth_state");
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onAuthChange]);

  const handleOAuthCallback = async (code: string) => {
    try {
      const redirectUri = getRedirectUri();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify-auth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            code,
            redirect_uri: redirectUri // CRITICAL: Must match the redirect_uri used in auth request
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error_description || errorData.error || "Failed to exchange code for token");
      }

      const data = await response.json();
      const { access_token, expires_in, refresh_token } = data;

      if (!access_token) {
        throw new Error("No access token received");
      }

      // Store token with expiry
      const expiryTime = Date.now() + (expires_in || 3600) * 1000;
      localStorage.setItem("spotify_access_token", access_token);
      localStorage.setItem("spotify_token_expiry", expiryTime.toString());
      
      // Store refresh token if provided
      if (refresh_token) {
        localStorage.setItem("spotify_refresh_token", refresh_token);
      }

      setAccessToken(access_token);
      setIsAuthenticated(true);
      onAuthChange(access_token);
      fetchUserProfile(access_token);

      toast({
        title: "Connected to Spotify!",
        description: "You can now use your playlists and liked songs.",
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Could not connect to Spotify. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    
    if (!clientId) {
      toast({
        title: "Configuration error",
        description: "Spotify Client ID not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem("spotify_oauth_state", state);

    // Get redirect URI (must be consistent)
    const redirectUri = getRedirectUri();
    
    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-library-read",
      "playlist-read-private",
      "playlist-read-collaborative",
    ].join(" ");

    // Build authorization URL
    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri, // Must match exactly in token exchange
      state: state, // CSRF protection
      show_dialog: "true", // Always show dialog (useful for testing)
    })}`;

    // Use full page redirect (recommended by Spotify docs)
    // The callback will be handled in useEffect when user returns
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_token_expiry");
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    onAuthChange(null);
    toast({
      title: "Disconnected from Spotify",
    });
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3 glass-card p-3 rounded-xl">
        {user.images && user.images[0] && (
          <img
            src={user.images[0].url}
            alt={user.display_name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.display_name}</p>
          <p className="text-xs text-muted-foreground">Spotify Connected</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      className="w-full border-primary/50 hover:bg-primary/10 hover:border-primary"
    >
      <LogIn className="w-4 h-4 mr-2" />
      Connect Spotify
    </Button>
  );
}

