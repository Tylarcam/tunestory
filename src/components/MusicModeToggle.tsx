import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MusicMode = "discover" | "generate";

interface MusicModeToggleProps {
  mode: MusicMode;
  onModeChange: (mode: MusicMode) => void;
  disabled?: boolean;
}

export function MusicModeToggle({ mode, onModeChange, disabled }: MusicModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-card/60 backdrop-blur-xl rounded-full p-1 border border-border/50">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange("discover")}
        disabled={disabled}
        className={cn(
          "px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2",
          mode === "discover"
            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
            : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Search className="w-4 h-4" />
        <span className="font-medium">Discover</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange("generate")}
        disabled={disabled}
        className={cn(
          "px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2",
          mode === "generate"
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
            : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">Generate</span>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">AI</span>
      </Button>
    </div>
  );
}

