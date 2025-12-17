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
      }
    }

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      toast({
        title: "Authentication failed",
        description: "Could not connect to Spotify. Please try again.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code) {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onAuthChange]);

  const handleOAuthCallback = async (code: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify-auth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to exchange code for token");
      }

      const data = await response.json();
      const { access_token, expires_in } = data;

      // Store token with expiry
      const expiryTime = Date.now() + expires_in * 1000;
      localStorage.setItem("spotify_access_token", access_token);
      localStorage.setItem("spotify_token_expiry", expiryTime.toString());

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
        description: "Could not connect to Spotify. Please try again.",
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

    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-library-read",
      "playlist-read-private",
      "playlist-read-collaborative",
    ].join(" ");

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      show_dialog: "true",
    })}`;

    // Open in popup window for better iframe compatibility
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      authUrl,
      "Spotify Login",
      `width=${width},height=${height},left=${left},top=${top},popup=yes`
    );

    // Poll for the popup to close and check for auth code
    const pollTimer = setInterval(() => {
      try {
        if (popup?.closed) {
          clearInterval(pollTimer);
          // Check if we got a code in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get("code");
          if (code) {
            handleOAuthCallback(code);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else if (popup?.location?.href?.includes(window.location.origin)) {
          const popupUrl = new URL(popup.location.href);
          const code = popupUrl.searchParams.get("code");
          if (code) {
            clearInterval(pollTimer);
            popup.close();
            handleOAuthCallback(code);
          }
        }
      } catch (e) {
        // Cross-origin error expected while on Spotify domain
      }
    }, 500);
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

