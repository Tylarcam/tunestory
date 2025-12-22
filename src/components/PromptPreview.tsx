import { FileText } from "lucide-react";

interface PromptPreviewProps {
  prompt: string;
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">Generated Prompt Preview</h3>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
        <code className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
          {prompt || "No prompt generated yet..."}
        </code>
      </div>
    </div>
  );
}

