import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Instrument } from "@/lib/instrumentOptions";

interface CompatibilitySuggestionsProps {
  suggestions: Instrument[];
  onAddSuggestion: (instrumentId: string) => void;
  disabled?: boolean;
}

export function CompatibilitySuggestions({
  suggestions,
  onAddSuggestion,
  disabled = false,
}: CompatibilitySuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2 border-t">
      <p className="text-xs font-medium text-muted-foreground">
        💡 Works well with:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((instrument) => (
          <Button
            key={instrument.id}
            variant="outline"
            size="sm"
            onClick={() => !disabled && onAddSuggestion(instrument.id)}
            disabled={disabled}
            className="h-8 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            {instrument.icon} {instrument.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

