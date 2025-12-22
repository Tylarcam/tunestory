import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { MusicGenModel } from "@/types/musicgen";

interface MusicGenOptionsProps {
  model: MusicGenModel;
  duration: number;
  onModelChange: (model: MusicGenModel) => void;
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

export function MusicGenOptions({
  model,
  duration,
  onModelChange,
  onDurationChange,
  disabled = false,
}: MusicGenOptionsProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Generation Settings</CardTitle>
        <CardDescription>
          Configure the music generation parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model-select">Model Size</Label>
          <Select
            value={model}
            onValueChange={(value) => onModelChange(value as MusicGenModel)}
            disabled={disabled}
          >
            <SelectTrigger id="model-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (Fastest)</SelectItem>
              <SelectItem value="medium">Medium (Balanced)</SelectItem>
              <SelectItem value="large">Large (Best Quality)</SelectItem>
              <SelectItem value="melody">Melody (Melodic Focus)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration-slider">
            Duration: {duration} seconds
          </Label>
          <Slider
            id="duration-slider"
            min={10}
            max={60}
            step={5}
            value={[duration]}
            onValueChange={([value]) => onDurationChange(value)}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10s</span>
            <span>60s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

