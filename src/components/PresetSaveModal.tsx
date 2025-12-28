<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
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
<<<<<<< HEAD
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
=======
import type { Preset } from "@/lib/localStorage";

interface PresetState {
  genre: string;
  instruments: string[];
  energy: string;
  blendRatio: number;
  vibeTemplate: string;
}

interface PresetSaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (preset: Preset) => void;
  currentState: PresetState;
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
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
<<<<<<< HEAD
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
=======
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      setError("Please enter a name for this preset");
      return;
    }

    // Check for duplicate names
    if (existingPresets.some((p) => p.name.toLowerCase() === name.toLowerCase().trim())) {
      setError("A preset with this name already exists");
      return;
    }

    const preset: Preset = {
      id: `preset-${Date.now()}`,
      name: name.trim(),
      genre: currentState.genre,
      instruments: currentState.instruments,
      energy: currentState.energy,
      blendRatio: currentState.blendRatio,
      vibeTemplate: currentState.vibeTemplate,
    };

    onSave(preset);
    setName("");
    setError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setName("");
    setError("");
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
<<<<<<< HEAD
          <DialogTitle>Save Custom Preset</DialogTitle>
          <DialogDescription>
            Give your preset a name to save your current settings for later use.
          </DialogDescription>
        </DialogHeader>

=======
          <DialogTitle>Save Preset</DialogTitle>
          <DialogDescription>
            Save your current music settings as a preset for quick access later.
          </DialogDescription>
        </DialogHeader>
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
<<<<<<< HEAD
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
=======
                setError("");
              }}
              placeholder="e.g., My Chill Vibe"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Preset</Button>
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

