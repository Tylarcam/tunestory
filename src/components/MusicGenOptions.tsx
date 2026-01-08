import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { MusicGenModel, MusicGenDecoder } from "@/types/musicgen";

interface MusicGenOptionsProps {
  model: MusicGenModel;
  decoder?: MusicGenDecoder;
  duration: number;
  onModelChange: (model: MusicGenModel) => void;
  onDecoderChange?: (decoder: MusicGenDecoder) => void;
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

const MODEL_DESCRIPTIONS: Record<MusicGenModel, { label: string; description: string }> = {
  small: {
    label: "MusicGen Small",
    description: "Fastest generation (~5-10s), good quality, best for quick tests"
  },
  medium: {
    label: "MusicGen Medium",
    description: "Balanced speed and quality (~10-20s), recommended for most use cases"
  },
  large: {
    label: "MusicGen Large",
    description: "Best quality, slower generation (~20-30s), for final productions"
  },
  melody: {
    label: "MusicGen Melody",
    description: "Generates music influenced by uploaded audio, unique style"
  }
};

export function MusicGenOptions({
  model,
  decoder = 'default',
  duration,
  onModelChange,
  onDecoderChange,
  onDurationChange,
  disabled = false
}: MusicGenOptionsProps) {
  return (
    <div className="space-y-6 glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Generation Options</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Adjust these settings to control generation speed, quality, and audio length.
                Higher quality models and multiband diffusion take longer but produce better results.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="model-select">Model</Label>
        <Select
          value={model}
          onValueChange={(value) => onModelChange(value as MusicGenModel)}
          disabled={disabled}
        >
          <SelectTrigger id="model-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MODEL_DESCRIPTIONS).map(([key, { label, description }]) => (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col">
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Decoder Toggle */}
      {onDecoderChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="decoder-switch">High Quality Decoder</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      MultiBand Diffusion decoder produces higher quality audio but takes longer to generate.
                      Default decoder is faster but may have slightly lower quality.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="decoder-switch"
              checked={decoder === 'multiband_diffusion'}
              onCheckedChange={(checked) => onDecoderChange(checked ? 'multiband_diffusion' : 'default')}
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {decoder === 'multiband_diffusion' 
              ? 'Using MultiBand Diffusion (higher quality, slower)' 
              : 'Using Default decoder (faster, good quality)'}
          </p>
        </div>
      )}

      {/* Duration Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="duration-slider">Duration</Label>
          <span className="text-sm font-medium">{duration}s</span>
        </div>
        <Slider
          id="duration-slider"
          min={1}
          max={30}
          step={1}
          value={[duration]}
          onValueChange={([value]) => onDurationChange(value)}
          disabled={disabled}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1s</span>
          <span>15s</span>
          <span>30s</span>
        </div>
      </div>
    </div>
  );
}
