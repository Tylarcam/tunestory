<<<<<<< HEAD
import { GENRE_CATEGORIES, type GenreOption, mapGeminiGenreToOption } from "@/lib/genreOptions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenreSelectProps {
  value: string | null;
  onChange: (genreId: string) => void;
  aiSuggestion?: string; // Gemini's suggested genre
  disabled?: boolean;
}

export function GenreSelect({ value, onChange, aiSuggestion, disabled }: GenreSelectProps) {
  const aiGenreId = aiSuggestion ? mapGeminiGenreToOption(aiSuggestion) : null;
  const selectedGenre = value || aiGenreId;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Genre</label>
      <Select
        value={selectedGenre || undefined}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a genre..." />
        </SelectTrigger>
        <SelectContent>
          {aiGenreId && (
            <>
              <SelectGroup>
                <SelectLabel className="text-primary font-semibold">
                  🎯 AI Suggested
                </SelectLabel>
                <SelectItem value={aiGenreId} className="font-medium">
                  {GENRE_CATEGORIES.flatMap((cat) => cat.options)
                    .find((opt) => opt.id === aiGenreId)?.label || aiSuggestion}
                </SelectItem>
              </SelectGroup>
              <div className="h-px bg-border my-2" />
            </>
          )}
          {GENRE_CATEGORIES.map((category) => (
            <SelectGroup key={category.category}>
              <SelectLabel>{category.category}</SelectLabel>
              {category.options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
=======
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
        value={value || "none"}
        onValueChange={(val) => onChange(val === "none" ? null : val)}
        disabled={disabled}
      >
        <SelectTrigger id="genre-select">
          <SelectValue placeholder="Select a genre (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None (use AI suggestion)</SelectItem>
          {genres.map((genre) => (
            <SelectItem key={genre.id} value={genre.id}>
              <span className="flex items-center gap-2">
                <span>{genre.icon}</span>
                <span>{genre.label}</span>
              </span>
            </SelectItem>
>>>>>>> ee02c99da9568b0d5115c986d6d40cf03bd659ba
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

