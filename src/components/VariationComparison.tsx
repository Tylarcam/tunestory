import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Download, Check } from "lucide-react";
import { useState } from "react";
import type { GeneratedTrack } from "@/types/musicgen";

interface VariationComparisonProps {
  variations: GeneratedTrack[];
  onSelectVariation: (index: number) => void;
  selectedIndex?: number;
}

export function VariationComparison({
  variations,
  onSelectVariation,
  selectedIndex,
}: VariationComparisonProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioElements, setAudioElements] = useState<Map<number, HTMLAudioElement>>(new Map());

  const handlePlay = (index: number) => {
    // Pause all other audio
    audioElements.forEach((audio, idx) => {
      if (idx !== index) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const audio = audioElements.get(index);
    if (audio) {
      if (playingIndex === index) {
        audio.pause();
        setPlayingIndex(null);
      } else {
        audio.play();
        setPlayingIndex(index);
      }
    } else {
      // Create new audio element
      const newAudio = new Audio(variations[index].audioUrl);
      newAudio.addEventListener('ended', () => setPlayingIndex(null));
      setAudioElements(new Map(audioElements).set(index, newAudio));
      newAudio.play();
      setPlayingIndex(index);
    }
  };

  const handleDownload = (index: number) => {
    const variation = variations[index];
    const link = document.createElement('a');
    link.href = variation.audioUrl;
    link.download = `variation-${index + 1}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (variations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Compare Variations</h3>
        <Badge variant="secondary">{variations.length} variations</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variations.map((variation, index) => (
          <Card key={index} className={`glass-card ${selectedIndex === index ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Variation {index + 1}</CardTitle>
                {selectedIndex === index && (
                  <Badge variant="default" className="gap-1">
                    <Check className="w-3 h-3" />
                    Selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {variation.prompt}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{variation.metadata.duration}s</span>
                  <span>•</span>
                  <span>{variation.metadata.model}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePlay(index)}
                  className="flex-1"
                >
                  {playingIndex === index ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(index)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedIndex === index ? "default" : "outline"}
                  onClick={() => onSelectVariation(index)}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

