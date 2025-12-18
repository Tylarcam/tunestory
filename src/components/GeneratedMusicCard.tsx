import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, RefreshCw, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeneratedMusicCardProps {
  audioUrl: string;
  prompt: string;
  metadata: {
    model: string;
    duration: number;
    status: string;
    framework?: string;
  };
  onRegenerate?: () => void;
}

export function GeneratedMusicCard({ 
  audioUrl, 
  prompt, 
  metadata,
  onRegenerate 
}: GeneratedMusicCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
  
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
  
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
  
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
  
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `tunestory-audiocraft-${Date.now()}.wav`;
    a.click();
  };
  
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  return (
    <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-lg">AI-Generated Track</h3>
        </div>
        <div className="text-xs text-muted-foreground bg-amber-500/10 px-3 py-1 rounded-full">
          AudioCraft
        </div>
      </div>
    
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    
      {/* Waveform Visualization */}
      <div className="h-24 bg-black/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
        <div className="flex items-center gap-0.5 h-full px-2">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-gradient-to-t from-amber-500 to-orange-500 rounded-full transition-all duration-100 ${
                isPlaying ? "animate-pulse" : ""
              }`}
              style={{ 
                height: `${20 + Math.random() * 70}%`,
                animationDelay: `${i * 0.03}s`,
                opacity: duration > 0 && (currentTime / duration > i / 40) ? 1 : 0.3
              }}
            />
          ))}
        </div>
      
        {/* Time Display */}
        <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/40 px-2 py-1 rounded">
          {formatTime(currentTime)} / {formatTime(duration || metadata.duration)}
        </div>
      </div>
    
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100"
          style={{ 
            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` 
          }}
        />
      </div>
    
      {/* Controls */}
      <div className="flex gap-3 mb-4">
        <Button
          onClick={togglePlay}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Play
            </>
          )}
        </Button>
      
        <Button
          onClick={handleDownload}
          variant="outline"
          size="icon"
          className="p-3 rounded-xl"
          title="Download WAV"
        >
          <Download className="w-5 h-5" />
        </Button>
      
        {onRegenerate && (
          <Button
            onClick={onRegenerate}
            variant="outline"
            size="icon"
            className="p-3 rounded-xl"
            title="Regenerate"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        )}
      </div>
    
      {/* Metadata */}
      <div className="text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>Generated with {metadata.model}</span>
        </div>
      
        <details className="cursor-pointer">
          <summary className="hover:text-foreground transition-colors select-none">
            View generation prompt →
          </summary>
          <p className="mt-2 p-3 bg-black/20 rounded-lg text-foreground/80 text-sm leading-relaxed">
            &quot;{prompt}&quot;
          </p>
        </details>
      </div>
    </div>
  );
}

