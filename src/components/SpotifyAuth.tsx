import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
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

  const fetchUserProfile = useCallback(async (token: string) => {
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
  }, []);

  const handleAuthSuccess = useCallback((token: string, expiresIn: number) => {
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem("spotify_access_token", token);
    localStorage.setItem("spotify_token_expiry", expiryTime.toString());

    setAccessToken(token);
    setIsAuthenticated(true);
    onAuthChange(token);
    fetchUserProfile(token);

    toast({
      title: "Connected to Spotify!",
      description: "You can now use your playlists and liked songs.",
    });
  }, [onAuthChange, fetchUserProfile]);

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
  }, [onAuthChange, fetchUserProfile]);

  // Listen for postMessage from the callback window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === "SPOTIFY_AUTH_SUCCESS") {
        const { access_token, expires_in } = event.data;
        handleAuthSuccess(access_token, expires_in);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleAuthSuccess]);

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

    // Use /callback route for the redirect
    const redirectUri = `${window.location.origin}/callback`;
    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-library-read",
      "playlist-read-private",
      "playlist-read-collaborative",
      "streaming",
      "user-read-playback-state",
      "user-modify-playback-state",
    ].join(" ");

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      show_dialog: "true",
    })}`;

    // Open in new tab - this escapes the Lovable iframe!
    window.open(authUrl, "_blank", "width=500,height=700,scrollbars=yes");
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
