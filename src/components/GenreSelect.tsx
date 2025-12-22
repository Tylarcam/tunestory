import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllGenres, getGenreLabel, mapGeminiGenreToOption } from "@/lib/genreOptions";
import { Info } from "lucide-react";

interface GenreSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  aiSuggestion?: string;
  disabled?: boolean;
}

export function GenreSelect({
  value,
  onChange,
  aiSuggestion,
  disabled = false,
}: GenreSelectProps) {
  const genres = getAllGenres();
  const aiGenreId = aiSuggestion ? mapGeminiGenreToOption(aiSuggestion) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="genre-select">Genre</Label>
        {aiSuggestion && aiGenreId && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            AI suggests: {getGenreLabel(aiGenreId)}
          </span>
        )}
      </div>
      <Select
        value={value || ""}
        onValueChange={(val) => onChange(val || null)}
        disabled={disabled}
      >
        <SelectTrigger id="genre-select">
          <SelectValue placeholder="Select a genre (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None (use AI suggestion)</SelectItem>
          {genres.map((genre) => (
            <SelectItem key={genre.id} value={genre.id}>
              <span className="flex items-center gap-2">
                <span>{genre.icon}</span>
                <span>{genre.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

