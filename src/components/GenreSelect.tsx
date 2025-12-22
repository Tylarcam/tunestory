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
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

