import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePresetName } from "@/lib/presetManager";
import type { Preset } from "@/lib/localStorage";

interface PresetSaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  currentState: {
    genre: string;
    instruments: string[];
    energy: string;
    blendRatio: number;
    vibeTemplate: string;
  };
  existingPresets: Preset[];
}

export function PresetSaveModal({
  open,
  onOpenChange,
  onSave,
  currentState,
  existingPresets,
}: PresetSaveModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setError(null);
    }
  }, [open]);

  const handleSave = () => {
    const validation = validatePresetName(name, existingPresets);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    onSave(name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Custom Preset</DialogTitle>
          <DialogDescription>
            Give your preset a name to save your current settings for later use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g., Study Vibes, Morning Coffee"
              maxLength={50}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-4">
            <p className="text-sm font-medium">This will save:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Genre: {currentState.genre}</li>
              <li>Instruments: {currentState.instruments.join(", ") || "None"}</li>
              <li>Energy: {currentState.energy}</li>
              <li>Blend Ratio: {currentState.blendRatio}%</li>
              {currentState.vibeTemplate && (
                <li>Vibe: "{currentState.vibeTemplate}"</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

