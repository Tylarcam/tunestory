import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, RotateCcw, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onReset?: () => void;
  disabled?: boolean;
}

export function PromptEditor({
  prompt,
  onPromptChange,
  onReset,
  disabled = false,
}: PromptEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [isEdited, setIsEdited] = useState(false);

  // Update local state when prompt prop changes (from auto-generation)
  useEffect(() => {
    if (!isEdited) {
      setEditedPrompt(prompt);
    }
  }, [prompt, isEdited]);

  const handleChange = (value: string) => {
    setEditedPrompt(value);
    setIsEdited(value !== prompt);
    onPromptChange(value);
  };

  const handleReset = () => {
    setEditedPrompt(prompt);
    setIsEdited(false);
    if (onReset) {
      onReset();
    }
  };

  const wordCount = editedPrompt.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editedPrompt.length;
  const isOptimalLength = wordCount >= 10 && wordCount <= 25;
  const isTooShort = wordCount > 0 && wordCount < 10;
  const isTooLong = wordCount > 25;

  if (!prompt) return null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Music Generation Prompt
              </CardTitle>
              {isEdited && (
                <Badge variant="secondary" className="text-xs">
                  Manually Edited
                </Badge>
              )}
              {!isEdited && (
                <Badge variant="outline" className="text-xs">
                  Auto-Generated
                </Badge>
              )}
            </div>
            <CardDescription>
              Edit the prompt that will be used for music generation (10-25 words recommended)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isEdited && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={disabled}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Textarea
            value={editedPrompt}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter your music generation prompt..."
            className={`font-mono text-sm min-h-[80px] ${
              isExpanded ? "" : "max-h-[120px]"
            }`}
            rows={isExpanded ? 6 : 3}
          />
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
              <span>{charCount} characters</span>
            </div>
            <div className="flex items-center gap-2">
              {isTooShort && (
                <span className="text-amber-500">
                  Too short (recommended: 10-25 words)
                </span>
              )}
              {isTooLong && (
                <span className="text-amber-500">
                  Too long (recommended: 10-25 words)
                </span>
              )}
              {isOptimalLength && (
                <span className="text-green-500">Optimal length</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

