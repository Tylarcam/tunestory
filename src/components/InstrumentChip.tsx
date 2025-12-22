import { cn } from "@/lib/utils";
import type { Instrument } from "@/lib/instrumentOptions";

interface InstrumentChipProps {
  instrument: Instrument;
  selected: boolean;
  onToggle: (instrumentId: string) => void;
  disabled?: boolean;
}

export function InstrumentChip({
  instrument,
  selected,
  onToggle,
  disabled = false,
}: InstrumentChipProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(instrument.id)}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <span className="text-base">{instrument.icon}</span>
      <span>{instrument.label}</span>
    </button>
  );
}

