import { useState, useRef, useEffect } from "react";
import { Play, Pause, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}

export function SongCard({ song, index, isPlaying, onPlay, onPause }: SongCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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
  }, [song.previewUrl, onPause]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <div
      className={cn(
        "glass-card p-4 transition-all duration-300 animate-fade-in-up group",
        isPlaying && "glow-primary ring-1 ring-primary/50"
      )}
      style={{ animationDelay: `${0.2 + index * 0.1}s` }}
    >
      <div className="flex gap-4">
        {/* Album Art */}
        <div className="relative shrink-0">
          <div className={cn(
            "w-20 h-20 rounded-xl overflow-hidden transition-transform duration-300",
            isPlaying && "animate-spin-slow"
          )}>
            <img
              src={song.albumArt}
              alt={song.album}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Play button overlay */}
          {song.previewUrl && (
            <button
              onClick={handlePlayPause}
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "bg-background/60 backdrop-blur-sm rounded-xl",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                isPlaying && "opacity-100"
              )}
            >
              <div className="p-2 rounded-full bg-primary text-primary-foreground">
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </div>
            </button>
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold truncate">{song.name}</h4>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          <p className="text-xs text-muted-foreground/70 truncate mt-1">{song.album}</p>
          
          {song.genre && (
            <Badge variant="outline" className="mt-2 text-xs border-primary/30">
              {song.genre}
            </Badge>
          )}
        </div>

        {/* Spotify Link */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 opacity-50 hover:opacity-100"
          onClick={() => window.open(song.spotifyUrl, "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress bar */}
      {isPlaying && song.previewUrl && (
        <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Waveform visualization when playing */}
      {isPlaying && (
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
