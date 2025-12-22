import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PromptPreviewProps {
  prompt: string;
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
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
  );
}

