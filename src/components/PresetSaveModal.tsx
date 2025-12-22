import { useState } from "react";
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Preset</DialogTitle>
          <DialogDescription>
            Save your current music settings as a preset for quick access later.
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

