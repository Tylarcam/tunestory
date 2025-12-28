<<<<<<< HEAD
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface PhotoAnalysisDisplayProps {
  analysis: {
    mood: string;
    energy: string;
    genres: string[];
    description?: string;
  };
  onReset: () => void;
}

export function PhotoAnalysisDisplay({ analysis, onReset }: PhotoAnalysisDisplayProps) {
  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-lg">Photo Analysis</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset All</span>
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-primary/50 bg-primary/10">
            {analysis.mood}
          </Badge>
          <Badge variant="outline" className="border-secondary/50 bg-secondary/10">
            {analysis.energy}
          </Badge>
          {analysis.genres.slice(0, 3).map((genre, i) => (
            <Badge
              key={i}
              variant="outline"
              className="border-border/50 bg-muted/50"
            >
              {genre}
            </Badge>
          ))}
        </div>
        {analysis.description && (
          <p className="text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-3">
            "{analysis.description}"
          </p>
        )}
      </div>
    </div>
=======
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PhotoAnalysis {
  mood: string;
  energy: string;
  genres: string[];
  description?: string;
}

interface PhotoAnalysisDisplayProps {
  analysis: PhotoAnalysis;
  onReset: () => void;
}

export function PhotoAnalysisDisplay({
  analysis,
  onReset,
}: PhotoAnalysisDisplayProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Photo Analysis</CardTitle>
            <CardDescription>AI's interpretation of your photo</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to AI
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Mood</div>
          <div className="text-lg font-semibold capitalize">{analysis.mood}</div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Energy</div>
          <Badge variant="secondary" className="text-sm">
            {analysis.energy}
          </Badge>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Genres</div>
          <div className="flex flex-wrap gap-2">
            {analysis.genres.map((genre, index) => (
              <Badge key={index} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
        
        {analysis.description && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
            <p className="text-sm text-muted-foreground">{analysis.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
  );
}

