import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RegenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function RegenerateButton({ onClick, isLoading }: RegenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      variant="outline"
      className={cn(
        "border-border/50 hover:bg-primary/10 hover:border-primary/50",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: "0.5s" }}
    >
      <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
      Try Different Vibes
    </Button>
  );
}
