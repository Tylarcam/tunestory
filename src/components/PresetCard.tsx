import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getInstrument, type InstrumentPreset } from "@/lib/instrumentOptions";

interface PresetCardProps {
  preset: InstrumentPreset;
  selected: boolean;
  onSelect: (presetId: string) => void;
  disabled?: boolean;
}

export function PresetCard({
  preset,
  selected,
  onSelect,
  disabled = false,
}: PresetCardProps) {
  const instruments = preset.instruments
    .map(id => getInstrument(id))
    .filter(Boolean);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && onSelect(preset.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{preset.icon}</span>
          <CardTitle className="text-lg">{preset.name}</CardTitle>
        </div>
        <CardDescription className="text-xs">{preset.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1.5">
          {instruments.map((instrument) => (
            <span
              key={instrument.id}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
            >
              <span>{instrument.icon}</span>
              <span>{instrument.label}</span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

