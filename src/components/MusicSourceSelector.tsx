import { useState } from "react";
import { Shuffle, Library, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpotifyAuth } from "@/components/SpotifyAuth";
import { PlaylistSelector } from "@/components/PlaylistSelector";
import { cn } from "@/lib/utils";

export type MusicSource = "random" | "playlist";

interface MusicSourceSelectorProps {
  imagePreviewUrl: string;
  onSelectRandom: () => void;
  onSelectPlaylist: (accessToken: string, playlistId: string | "liked") => void;
}

export function MusicSourceSelector({
  imagePreviewUrl,
  onSelectRandom,
  onSelectPlaylist,
}: MusicSourceSelectorProps) {
  const [selectedSource, setSelectedSource] = useState<MusicSource | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | "liked">("liked");

  const handleContinueWithPlaylist = () => {
    if (spotifyToken) {
      onSelectPlaylist(spotifyToken, selectedPlaylist);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Image preview */}
      <div className="glass-card p-2 max-w-sm mx-auto">
        <div className="aspect-square rounded-xl overflow-hidden">
          <img
            src={imagePreviewUrl}
            alt="Your uploaded photo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="text-center">
        <h2 className="font-display font-semibold text-xl mb-2">
          How should we find your music?
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose how to generate recommendations based on your photo's vibe
        </p>
      </div>

      {/* Source options */}
      <div className="grid gap-4">
        {/* Random option */}
        <button
          onClick={() => setSelectedSource("random")}
          className={cn(
            "glass-card p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02]",
            selectedSource === "random" && "ring-2 ring-primary glow-primary"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Shuffle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Discover New Music</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get fresh recommendations from Spotify's entire catalog based on your photo's mood
              </p>
            </div>
            <ChevronRight className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              selectedSource === "random" && "text-primary"
            )} />
          </div>
        </button>

        {/* Playlist option */}
        <button
          onClick={() => setSelectedSource("playlist")}
          className={cn(
            "glass-card p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02]",
            selectedSource === "playlist" && "ring-2 ring-secondary glow-secondary"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-secondary/20">
              <Library className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">From My Library</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Find songs from your own Spotify playlists that match your photo's vibe
              </p>
            </div>
            <ChevronRight className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              selectedSource === "playlist" && "text-secondary"
            )} />
          </div>
        </button>
      </div>

      {/* Actions based on selection */}
      {selectedSource === "random" && (
        <div className="animate-fade-in-up">
          <Button
            onClick={onSelectRandom}
            className="w-full py-6 text-lg font-semibold glow-primary"
            size="lg"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Find My Soundtrack
          </Button>
        </div>
      )}

      {selectedSource === "playlist" && (
        <div className="space-y-4 animate-fade-in-up">
          <SpotifyAuth onAuthChange={setSpotifyToken} />
          
          {spotifyToken && (
            <>
              <PlaylistSelector
                accessToken={spotifyToken}
                onSelectionChange={setSelectedPlaylist}
              />
              
              <Button
                onClick={handleContinueWithPlaylist}
                className="w-full py-6 text-lg font-semibold glow-secondary"
                size="lg"
              >
                <Library className="w-5 h-5 mr-2" />
                Match from My Library
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
