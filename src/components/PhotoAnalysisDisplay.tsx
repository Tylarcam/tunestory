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
  );
}

