import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Music, Headphones, Piano, Guitar, ChevronDown, Settings2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAllPresets,
  getAllCategories,
  getInstrument,
  type InstrumentPreset,
} from "@/lib/instrumentOptions";

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const presets = getAllPresets();
  const categories = getAllCategories();
  
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

  const handleToggleInstrument = (instrumentId: string) => {
    if (disabled) return;
    
    if (selectedInstruments.includes(instrumentId)) {
      onInstrumentsChange(selectedInstruments.filter((id) => id !== instrumentId));
    } else {
      onInstrumentsChange([...selectedInstruments, instrumentId]);
    }
  };

  const handleClearAll = () => {
    if (disabled) return;
    onInstrumentsChange([]);
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

      {/* Preset Grid */}
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

      {/* Advanced Settings Collapsible */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Advanced: Pick Your Own
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              showAdvanced && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 pt-3">
          {/* Selected Instruments Display */}
          {selectedInstruments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50">
              {selectedInstruments.map((id) => {
                const instrument = getInstrument(id);
                if (!instrument) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span>{instrument.icon}</span>
                    <span>{instrument.label}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleInstrument(id)}
                      className="ml-1 p-0.5 rounded-full hover:bg-background/50"
                      disabled={disabled}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-6 text-xs text-muted-foreground"
                disabled={disabled}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Category-based Instrument Selection */}
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <span>{category.icon}</span>
                {category.label}
              </Label>
              <div className="flex flex-wrap gap-2">
                {category.instruments.map((instrumentId) => {
                  const instrument = getInstrument(instrumentId);
                  if (!instrument) return null;
                  
                  const isSelected = selectedInstruments.includes(instrumentId);
                  
                  return (
                    <button
                      key={instrumentId}
                      type="button"
                      onClick={() => handleToggleInstrument(instrumentId)}
                      disabled={disabled}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                        "border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                        "disabled:pointer-events-none disabled:opacity-50",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <span>{instrument.icon}</span>
                      <span>{instrument.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
