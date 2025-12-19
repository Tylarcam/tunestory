import { useState, useRef, useEffect } from "react";
import { Play, Pause, ExternalLink, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  spotifyUrl: string;
  genre?: string;
}

interface SongCardProps {
  song: Song;
  index: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  // Spotify SDK props
  spotifyPlayer?: {
    isReady: boolean;
    currentTrack: string | null;
    progress: number;
    duration: number;
    play: (trackId: string) => Promise<void>;
    pause: () => Promise<void>;
    isPlaying: boolean;
  };
  useSpotifySDK?: boolean;
}

export function SongCard({ 
  song, 
  index, 
  isPlaying, 
  onPlay, 
  onPause,
  spotifyPlayer,
  useSpotifySDK = false,
}: SongCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSDKPlaying, setIsSDKPlaying] = useState(false);

  // Determine if this song is currently playing via SDK
  const isPlayingViaSDK = useSpotifySDK && 
    spotifyPlayer?.isReady && 
    spotifyPlayer?.currentTrack === song.id && 
    spotifyPlayer?.isPlaying;

  // Use SDK progress if available
  const displayProgress = isPlayingViaSDK && spotifyPlayer?.duration 
    ? (spotifyPlayer.progress / spotifyPlayer.duration) * 100 
    : progress;

  const currentlyPlaying = isPlayingViaSDK || isPlaying;

  // Handle preview audio for non-SDK mode
  useEffect(() => {
    if (useSpotifySDK && spotifyPlayer?.isReady) {
      // Don't create audio element if using SDK
      return;
    }

    if (song.previewUrl) {
      audioRef.current = new Audio(song.previewUrl);
      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      });
      audioRef.current.addEventListener("ended", onPause);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [song.previewUrl, onPause, useSpotifySDK, spotifyPlayer?.isReady]);

  // Handle play/pause for preview mode
  useEffect(() => {
    if (useSpotifySDK && spotifyPlayer?.isReady) {
      return; // SDK handles its own playback
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, useSpotifySDK, spotifyPlayer?.isReady]);

  const handlePlayPause = async () => {
    if (useSpotifySDK && spotifyPlayer?.isReady) {
      // Use Spotify SDK
      if (isPlayingViaSDK) {
        await spotifyPlayer.pause();
        onPause();
      } else {
        await spotifyPlayer.play(song.id);
        onPlay();
        setIsSDKPlaying(true);
      }
    } else if (song.previewUrl) {
      // Use preview audio
      if (isPlaying) {
        onPause();
      } else {
        onPlay();
      }
    }
  };

  const hasPlaybackOption = (useSpotifySDK && spotifyPlayer?.isReady) || song.previewUrl;
  const isSDKMode = useSpotifySDK && spotifyPlayer?.isReady;

  return (
    <div
      className={cn(
        "glass-card p-4 transition-all duration-300 animate-fade-in-up group",
        currentlyPlaying && "glow-primary ring-1 ring-primary/50"
      )}
      style={{ animationDelay: `${0.2 + index * 0.1}s` }}
    >
      <div className="flex gap-4">
        {/* Album Art */}
        <div className="relative shrink-0">
          <div className={cn(
            "w-20 h-20 rounded-xl overflow-hidden transition-transform duration-300",
            currentlyPlaying && "animate-spin-slow"
          )}>
            <img
              src={song.albumArt}
              alt={song.album}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Play button overlay */}
          {hasPlaybackOption ? (
            <button
              onClick={handlePlayPause}
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "bg-background/60 backdrop-blur-sm rounded-xl",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                currentlyPlaying && "opacity-100"
              )}
            >
              <div className="p-2 rounded-full bg-primary text-primary-foreground">
                {currentlyPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </div>
            </button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      "bg-background/60 backdrop-blur-sm rounded-xl",
                      "opacity-0 group-hover:opacity-100 transition-opacity cursor-not-allowed"
                    )}
                  >
                    <div className="p-2 rounded-full bg-muted text-muted-foreground">
                      <Headphones className="w-5 h-5" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview not available. Open in Spotify to listen.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold truncate">{song.name}</h4>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          <p className="text-xs text-muted-foreground/70 truncate mt-1">{song.album}</p>
          
          <div className="flex items-center gap-2 mt-2">
            {song.genre && (
              <Badge variant="outline" className="text-xs border-primary/30">
                {song.genre}
              </Badge>
            )}
            {isSDKMode && (
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                Full Track
              </Badge>
            )}
            {!hasPlaybackOption && (
              <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                Spotify Only
              </Badge>
            )}
          </div>
        </div>

        {/* Spotify Link */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "shrink-0 transition-opacity",
                  hasPlaybackOption ? "opacity-50 hover:opacity-100" : "opacity-100"
                )}
                onClick={() => window.open(song.spotifyUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open in Spotify</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Progress bar */}
      {currentlyPlaying && hasPlaybackOption && (
        <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
      )}

      {/* Waveform visualization when playing */}
      {currentlyPlaying && (
        <div className="flex items-end justify-center gap-0.5 h-8 mt-3">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-primary/50 to-primary rounded-full animate-waveform"
              style={{
                animationDelay: `${i * 0.05}s`,
                height: "20%",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
