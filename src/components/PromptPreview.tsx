<<<<<<< HEAD
import { FileText } from "lucide-react";
=======
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba

interface PromptPreviewProps {
  prompt: string;
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
<<<<<<< HEAD
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
=======
  const [isExpanded, setIsExpanded] = useState(false);

  if (!prompt) return null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Music Generation Prompt
            </CardTitle>
            <CardDescription>
              Preview the prompt that will be used for music generation
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-sm font-mono bg-muted/50 rounded-md p-4 ${
            isExpanded ? "" : "line-clamp-3"
          }`}
        >
          {prompt}
        </div>
      </CardContent>
    </Card>
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
  );
}

