import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Music } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface Playlist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracks?: { total: number };
}

interface PlaylistSelectorProps {
  accessToken: string | null;
  onSelectionChange: (playlistId: string | "liked") => void;
  disabled?: boolean;
}

export function PlaylistSelector({ accessToken, onSelectionChange, disabled }: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedId, setSelectedId] = useState<string | "liked">("liked");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accessToken) {
      fetchPlaylists(accessToken);
    } else {
      setPlaylists([]);
      setSelectedId("liked");
    }
  }, [accessToken]);

  const fetchPlaylists = async (token: string) => {
    setLoading(true);
    try {
      const allPlaylists: Playlist[] = [];
      let url = "https://api.spotify.com/v1/me/playlists?limit=50";

      // Fetch all playlists (handle pagination)
      while (url) {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch playlists");
        }

        const data = await response.json();
        allPlaylists.push(...data.items);
        url = data.next;
      }

      setPlaylists(allPlaylists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      toast({
        title: "Failed to load playlists",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (value: string) => {
    setSelectedId(value as string | "liked");
    onSelectionChange(value as string | "liked");
  };

  if (!accessToken) {
    return (
      <div className="glass-card p-4 rounded-xl text-center text-muted-foreground">
        <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Connect Spotify to select a playlist</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Music Source</label>
      <Select
        value={selectedId}
        onValueChange={handleSelectionChange}
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a playlist">
            {selectedId === "liked" ? (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Liked Songs</span>
              </div>
            ) : (
              playlists.find((p) => p.id === selectedId)?.name || "Select playlist"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="liked">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Liked Songs</span>
            </div>
          </SelectItem>
          {playlists.map((playlist) => (
            <SelectItem key={playlist.id} value={playlist.id}>
              <div className="flex items-center gap-2">
                {playlist.images && playlist.images[0] ? (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="w-4 h-4 rounded"
                  />
                ) : (
                  <Music className="w-4 h-4" />
                )}
                <span className="truncate">{playlist.name}</span>
                {playlist.tracks && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {playlist.tracks.total}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && (
        <p className="text-xs text-muted-foreground">Loading playlists...</p>
      )}
    </div>
  );
}

