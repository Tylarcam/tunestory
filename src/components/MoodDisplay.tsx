import { Sparkles, Zap, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MoodData {
  mood: string;
  energy: string;
  genres: string[];
  description: string;
}

interface MoodDisplayProps {
  moodData: MoodData;
}

export function MoodDisplay({ moodData }: MoodDisplayProps) {
  const getEnergyColor = (energy: string) => {
    const level = energy.toLowerCase();
    if (level.includes("high") || level.includes("energetic")) return "bg-accent text-accent-foreground";
    if (level.includes("medium") || level.includes("moderate")) return "bg-secondary text-secondary-foreground";
    return "bg-primary text-primary-foreground";
  };

  return (
    <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">Vibe Analysis</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mood</p>
            <p className="font-medium">{moodData.mood}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/20">
            <Zap className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Energy</p>
            <Badge className={getEnergyColor(moodData.energy)} variant="secondary">
              {moodData.energy}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Genres</p>
          <div className="flex flex-wrap gap-2">
            {moodData.genres.map((genre, i) => (
              <Badge
                key={i}
                variant="outline"
                className="border-border/50 bg-muted/50"
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-3">
          "{moodData.description}"
        </p>
      </div>
    </div>
  );
}
