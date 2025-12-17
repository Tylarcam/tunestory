import { Image, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type VibeMode = "photo" | "music";

interface VibeModeToggleProps {
  mode: VibeMode;
  onModeChange: (mode: VibeMode) => void;
  disabled?: boolean;
}

export function VibeModeToggle({ mode, onModeChange, disabled }: VibeModeToggleProps) {
  return (
    <div className="glass-card p-1 inline-flex gap-1 rounded-xl">
      <Button
        variant={mode === "photo" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("photo")}
        disabled={disabled}
        className={cn(
          "gap-2",
          mode === "photo" && "bg-primary text-primary-foreground"
        )}
      >
        <Image className="w-4 h-4" />
        Photo
      </Button>
      <Button
        variant={mode === "music" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("music")}
        disabled={disabled}
        className={cn(
          "gap-2",
          mode === "music" && "bg-primary text-primary-foreground"
        )}
      >
        <Music className="w-4 h-4" />
        My Music
      </Button>
    </div>
  );
}

