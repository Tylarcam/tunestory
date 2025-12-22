import { InstrumentChip } from "./InstrumentChip";
import { getInstrumentsByCategory, type InstrumentCategory as InstrumentCategoryType } from "@/lib/instrumentOptions";

interface InstrumentCategoryProps {
  category: InstrumentCategoryType;
  selectedInstruments: string[];
  onToggleInstrument: (instrumentId: string) => void;
  disabled?: boolean;
}

export function InstrumentCategory({
  category,
  selectedInstruments,
  onToggleInstrument,
  disabled = false,
}: InstrumentCategoryProps) {
  const instruments = getInstrumentsByCategory(category.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{category.icon}</span>
        <div>
          <h4 className="font-medium text-sm">{category.label}</h4>
          {category.description && (
            <p className="text-xs text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {instruments.map((instrument) => (
          <InstrumentChip
            key={instrument.id}
            instrument={instrument}
            selected={selectedInstruments.includes(instrument.id)}
            onToggle={onToggleInstrument}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

