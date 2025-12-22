import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export type VariationStrategy = 'seed' | 'params' | 'both';

interface VariationStrategySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: VariationStrategy;
  onStrategyChange: (strategy: VariationStrategy) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export function VariationStrategySelector({
  open,
  onOpenChange,
  strategy,
  onStrategyChange,
  onConfirm,
  disabled = false,
}: VariationStrategySelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Variations</DialogTitle>
          <DialogDescription>
            Choose how to generate 3-4 variations of your music
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={strategy} onValueChange={(value) => onStrategyChange(value as VariationStrategy)}>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value="seed" id="strategy-seed" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="strategy-seed" className="cursor-pointer font-semibold">
                    Seed Variations
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Same prompt with different random seeds. Best for exploring different interpretations of the same idea.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value="params" id="strategy-params" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="strategy-params" className="cursor-pointer font-semibold">
                    Parameter Variations
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Different style and energy combinations. Best for exploring different moods and production styles.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value="both" id="strategy-both" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="strategy-both" className="cursor-pointer font-semibold">
                    Both (Recommended)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mix of seed and parameter variations. Provides the most diverse set of options.
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={disabled}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={disabled} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate 3 Variations
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

