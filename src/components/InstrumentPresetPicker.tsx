import { Label } from "@/components/ui/label";
import { Music, Headphones, Piano, Guitar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllPresets, type InstrumentPreset } from "@/lib/instrumentOptions";

interface InstrumentPresetPickerProps {
  selectedInstruments: string[];
  onInstrumentsChange: (instruments: string[]) => void;
  disabled?: boolean;
}

const PRESET_ICONS: Record<string, React.ReactNode> = {
  "acoustic": <Guitar className="w-5 h-5" />,
  "electronic": <Headphones className="w-5 h-5" />,
  "cinematic": <Music className="w-5 h-5" />,
  "piano": <Piano className="w-5 h-5" />,
};

export function InstrumentPresetPicker({
  selectedInstruments,
  onInstrumentsChange,
  disabled = false,
}: InstrumentPresetPickerProps) {
  const presets = getAllPresets();
  
  // Find which preset matches current selection
  const activePresetId = presets.find(
    (preset) =>
      preset.instruments.length === selectedInstruments.length &&
      preset.instruments.every((id) => selectedInstruments.includes(id))
  )?.id || null;

  const handleSelectPreset = (preset: InstrumentPreset) => {
    if (disabled) return;
    onInstrumentsChange([...preset.instruments]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm">
          <Music className="w-4 h-4" />
          Instrument Style
        </Label>
        {selectedInstruments.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {selectedInstruments.length} selected
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presets.slice(0, 4).map((preset) => {
          const isActive = activePresetId === preset.id;
          const icon = PRESET_ICONS[preset.id] || <Music className="w-5 h-5" />;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-border bg-card hover:border-primary/50 hover:bg-accent"
              )}
            >
              <div className={cn(
                "p-2 rounded-full",
                isActive ? "bg-primary/20" : "bg-muted"
              )}>
                {icon}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{preset.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {preset.instruments.length} instruments
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Choose a style or customize after analysis
      </p>
    </div>
  );
}
