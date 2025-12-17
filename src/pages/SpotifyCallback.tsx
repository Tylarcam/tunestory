import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function SpotifyCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");

      if (error) {
        setStatus("error");
        setErrorMessage("Authorization was denied or cancelled.");
        return;
      }

      if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received.");
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/callback`;
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify-auth`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ code, redirect_uri: redirectUri }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to exchange code for token");
        }

        const data = await response.json();
        const { access_token, expires_in } = data;

        // Send tokens back to the opener window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "SPOTIFY_AUTH_SUCCESS",
              access_token,
              expires_in,
            },
            window.location.origin
          );
          setStatus("success");
          
          // Close this window after a short delay
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          // If no opener (user navigated directly), store tokens and redirect
          const expiryTime = Date.now() + expires_in * 1000;
          localStorage.setItem("spotify_access_token", access_token);
          localStorage.setItem("spotify_token_expiry", expiryTime.toString());
          setStatus("success");
          
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }
      } catch (err) {
        console.error("Token exchange error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Connecting to Spotify</h1>
            <p className="text-muted-foreground">Please wait while we complete the authorization...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Connected!</h1>
            <p className="text-muted-foreground">
              {window.opener ? "This window will close automatically..." : "Redirecting back to the app..."}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Connection Failed</h1>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <button
              onClick={() => window.close()}
              className="text-primary hover:underline"
            >
              Close this window
            </button>
          </>
        )}
      </div>
    </div>
  );
}
