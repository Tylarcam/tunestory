<<<<<<< HEAD
import { useState } from "react";
=======
import { Button } from "@/components/ui/button";
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
<<<<<<< HEAD
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Check, X, BookOpen, Plus } from "lucide-react";
=======
import { ChevronDown, Plus, Trash2 } from "lucide-react";
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
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
<<<<<<< HEAD
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleDelete = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(presetId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeletePreset(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Presets</span>
            <span className="sm:hidden">Presets</span>
            {currentPresetId && (
              <span className="ml-1 text-xs text-muted-foreground">•</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Your Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {presets.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No presets saved yet
            </div>
          ) : (
            presets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => {
                  onLoadPreset(preset.id);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {currentPresetId === preset.id && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                  <span className="truncate">{preset.name}</span>
                </div>
                <button
                  onClick={(e) => handleDelete(preset.id, e)}
                  className="ml-2 p-1 hover:bg-destructive/10 rounded transition-colors"
                  aria-label={`Delete ${preset.name}`}
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onCreateNew} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Create New Preset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{presets.find((p) => p.id === deleteConfirmId)?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
=======
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
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
  );
}

