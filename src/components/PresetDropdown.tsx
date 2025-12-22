import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import type { Preset } from "@/lib/localStorage";

interface PresetDropdownProps {
  presets: Preset[];
  currentPresetId: string | null;
  onLoadPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  onCreateNew: () => void;
}

export function PresetDropdown({
  presets,
  currentPresetId,
  onLoadPreset,
  onDeletePreset,
  onCreateNew,
}: PresetDropdownProps) {
  const currentPreset = presets.find((p) => p.id === currentPresetId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {currentPreset ? currentPreset.name : "Presets"}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Saved Presets</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Preset
        </DropdownMenuItem>
        {presets.length > 0 && <DropdownMenuSeparator />}
        {presets.map((preset) => (
          <div key={preset.id} className="flex items-center justify-between">
            <DropdownMenuItem
              onClick={() => onLoadPreset(preset.id)}
              className="flex-1 cursor-pointer"
            >
              {preset.name}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeletePreset(preset.id)}
              className="cursor-pointer text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </DropdownMenuItem>
          </div>
        ))}
        {presets.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No presets saved
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

