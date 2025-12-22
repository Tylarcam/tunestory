import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X } from "lucide-react";
import { INSTRUMENTS, INSTRUMENT_PRESETS, type Instrument } from "@/lib/instrumentOptions";
import { getGenreLabel } from "@/lib/genreOptions";
import { cn } from "@/lib/utils";

interface QuickInstrumentSelectProps {
  selectedGenre: string | null;
  selectedInstruments: string[];
  onInstrumentsChange: (instruments: string[]) => void;
  disabled?: boolean;
}

/**
 * Get suggested instruments for a genre based on presets
 */
function getSuggestedInstrumentsForGenre(genreId: string | null): string[] {
  if (!genreId) return [];

  // Find presets that match this genre
  const matchingPresets = Object.values(INSTRUMENT_PRESETS).filter(
    (preset) => preset.genre === genreId
  );

  if (matchingPresets.length > 0) {
    // Use the first matching preset's instruments
    return matchingPresets[0].instruments;
  }

  // Fallback: genre-based defaults
  const genreDefaults: Record<string, string[]> = {
    'electronic': ['drums', 'synth-bass', 'synth'],
    'ambient-electronic': ['ambient', 'synth', 'strings'],
    'lofi-hiphop': ['soft-drums', 'bass', 'piano'],
    'jazz-fusion': ['soft-drums', 'bass', 'piano', 'saxophone'],
    'indie-rock': ['drums', 'bass', 'guitar', 'piano'],
    'cinematic-orchestral': ['strings', 'brass', 'piano', 'ambient'],
    'pop': ['drums', 'bass', 'synth', 'piano'],
    'rock': ['drums', 'bass', 'electric-guitar'],
    'folk': ['guitar', 'piano', 'strings'],
    'classical': ['strings', 'piano', 'brass'],
    'hip-hop': ['drums', 'bass', 'synth'],
    'r&b': ['soft-drums', 'bass', 'piano', 'vocals'],
    'dance': ['drums', 'synth-bass', 'synth'],
    'ambient': ['ambient', 'synth', 'strings', 'piano'],
  };

  return genreDefaults[genreId] || ['piano', 'bass', 'drums'];
}

export function QuickInstrumentSelect({
  selectedGenre,
  selectedInstruments,
  onInstrumentsChange,
  disabled = false,
}: QuickInstrumentSelectProps) {
  if (!selectedGenre) {
    return (
      <div className="space-y-2">
        <Label>Quick Instrument Selection</Label>
        <p className="text-sm text-muted-foreground">
          Select a genre to see suggested instruments
        </p>
      </div>
    );
  }

  const suggestedInstruments = getSuggestedInstrumentsForGenre(selectedGenre);
  const genreLabel = getGenreLabel(selectedGenre);

  const handleToggleInstrument = (instrumentId: string) => {
    if (disabled) return;

    if (selectedInstruments.includes(instrumentId)) {
      // Remove instrument
      onInstrumentsChange(selectedInstruments.filter((id) => id !== instrumentId));
    } else {
      // Add instrument
      onInstrumentsChange([...selectedInstruments, instrumentId]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onInstrumentsChange([...suggestedInstruments]);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onInstrumentsChange([]);
  };

  const allSelected = suggestedInstruments.every((id) =>
    selectedInstruments.includes(id)
  );
  const someSelected = suggestedInstruments.some((id) =>
    selectedInstruments.includes(id)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Quick Select for {genreLabel}
          </Label>
          <p className="text-xs text-muted-foreground">
            Suggested instruments for this genre
          </p>
        </div>
        <div className="flex items-center gap-2">
          {someSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
              className="h-7 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
          {!allSelected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={disabled}
              className="h-7 text-xs"
            >
              Select All
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestedInstruments.map((instrumentId) => {
          const instrument = INSTRUMENTS[instrumentId];
          if (!instrument) return null;

          const isSelected = selectedInstruments.includes(instrumentId);

          return (
            <button
              key={instrumentId}
              type="button"
              onClick={() => handleToggleInstrument(instrumentId)}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className="text-base">{instrument.icon}</span>
              <span>{instrument.label}</span>
            </button>
          );
        })}
      </div>

      {selectedInstruments.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Selected:</span>
          <div className="flex flex-wrap gap-1">
            {selectedInstruments.map((id) => {
              const instrument = INSTRUMENTS[id];
              if (!instrument) return null;
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="text-xs"
                >
                  {instrument.icon} {instrument.label}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

