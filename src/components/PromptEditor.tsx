import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, RotateCcw, Edit2, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { augmentPrompt } from "@/services/promptAugmenter";

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onReset?: () => void;
  disabled?: boolean;
  context?: {
    genre?: string;
    mood?: string;
    energy?: string;
    instruments?: string[];
  };
}

export function PromptEditor({
  prompt,
  onPromptChange,
  onReset,
  disabled = false,
  context,
}: PromptEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [isEdited, setIsEdited] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const [rewriteDirection, setRewriteDirection] = useState("");
  const [isAugmenting, setIsAugmenting] = useState(false);

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

  const handleRewrite = async () => {
    if (!rewriteDirection.trim()) return;

    setIsAugmenting(true);
    try {
      const result = await augmentPrompt({
        currentPrompt: editedPrompt,
        direction: rewriteDirection,
        context,
      });

      if (result.success && result.augmentedPrompt) {
        setEditedPrompt(result.augmentedPrompt);
        setIsEdited(true);
        onPromptChange(result.augmentedPrompt);
        setRewriteDirection("");
        setShowRewrite(false);
      } else {
        throw new Error(result.error || "Failed to augment prompt");
      }
    } catch (error) {
      console.error("Rewrite error:", error);
      // You might want to show a toast here
    } finally {
      setIsAugmenting(false);
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
              onClick={() => setShowRewrite(!showRewrite)}
              disabled={disabled || isAugmenting}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Rewrite
            </Button>
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
        {showRewrite && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Input
                value={rewriteDirection}
                onChange={(e) => setRewriteDirection(e.target.value)}
                placeholder="e.g., make it more cinematic, add more energy, make it lo-fi..."
                disabled={disabled || isAugmenting}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleRewrite();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleRewrite}
                disabled={disabled || isAugmenting || !rewriteDirection.trim()}
                className="gap-2"
              >
                {isAugmenting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Rewrite
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Describe how you want the prompt changed (e.g., "more cinematic", "add vintage feel")
            </p>
          </div>
        )}
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

