import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Settings, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { GenreSelect } from "./GenreSelect";
import { PresetDropdown } from "./PresetDropdown";
import { PresetSaveModal } from "./PresetSaveModal";
import { InstrumentSelector } from "./InstrumentSelector";
import { QuickInstrumentSelect } from "./QuickInstrumentSelect";
import type { UserPreferences, Preset } from "@/lib/localStorage";
import { createPresetObject } from "@/lib/presetManager";
import { mapGeminiGenreToOption } from "@/lib/genreOptions";

interface PhotoAnalysis {
  mood: string;
  energy: string | number;
  genres: string[];
  description?: string;
}

interface MusicRefinementControlsProps {
  analysis: PhotoAnalysis;
  userPreferences: UserPreferences | null;
  savedPresets: Preset[];
  selectedGenre: string | null;
  selectedInstruments: string[];
  energyLevel: string | null;
  blendRatio: number;
  userVibeText: string;
  showAdvanced: boolean;
  currentPresetId: string | null;
  styleLevel: number;
  vocalType: 'instrumental' | 'minimal-vocals' | 'vocal-focused';
  onGenreChange: (genre: string) => void;
  onInstrumentsChange: (instruments: string[]) => void;
  onEnergyChange: (energy: string) => void;
  onBlendRatioChange: (ratio: number) => void;
  onVibeTextChange: (text: string) => void;
  onShowAdvancedChange: (show: boolean) => void;
  onStyleLevelChange: (level: number) => void;
  onVocalTypeChange: (type: 'instrumental' | 'minimal-vocals' | 'vocal-focused') => void;
  onGenerateVariations?: () => void;
  onSavePreset: (preset: Preset) => void;
  onLoadPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  onSaveAsDefault: (preferences: UserPreferences) => void;
  disabled?: boolean;
}

export function MusicRefinementControls({
  analysis,
  userPreferences,
  savedPresets,
  selectedGenre,
  selectedInstruments,
  energyLevel,
  blendRatio,
  userVibeText,
  showAdvanced,
  currentPresetId,
  styleLevel,
  vocalType,
  onGenreChange,
  onInstrumentsChange,
  onEnergyChange,
  onBlendRatioChange,
  onVibeTextChange,
  onShowAdvancedChange,
  onStyleLevelChange,
  onVocalTypeChange,
  onGenerateVariations,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onSaveAsDefault,
  disabled = false,
}: MusicRefinementControlsProps) {
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"simple" | "advanced">(showAdvanced ? "advanced" : "simple");

  // Sync tab with showAdvanced state
  useEffect(() => {
    setActiveTab(showAdvanced ? "advanced" : "simple");
  }, [showAdvanced]);

  const handleTabChange = (value: string) => {
    const isAdvanced = value === "advanced";
    onShowAdvancedChange(isAdvanced);
    setActiveTab(isAdvanced ? "advanced" : "simple");
  };

  const handleSavePreset = (name: string) => {
    const aiGenre = analysis.genres[0] || "";
    const genreId = selectedGenre || mapGeminiGenreToOption(aiGenre);
    const finalEnergy = energyLevel || (typeof analysis.energy === "string" ? analysis.energy : "Medium");

    const preset = createPresetObject(
      name,
      {
        genre: genreId,
        instruments: selectedInstruments,
        energy: finalEnergy,
        blendRatio,
        vibeTemplate: userVibeText,
      }
    );

    onSavePreset(preset);
  };

  const handleSaveAsDefault = () => {
    const aiGenre = analysis.genres[0] || "";
    const genreId = selectedGenre || mapGeminiGenreToOption(aiGenre);
    const finalEnergy = energyLevel || (typeof analysis.energy === "string" ? analysis.energy : "Medium");

    const preferences: UserPreferences = {
      defaultGenre: genreId,
      defaultInstruments: selectedInstruments.length > 0 ? selectedInstruments : null,
      defaultEnergy: finalEnergy,
      defaultBlendRatio: blendRatio !== 30 ? blendRatio : null,
      alwaysShowAdvanced: showAdvanced,
    };

    onSaveAsDefault(preferences);
  };

  const aiGenre = analysis.genres[0] || "";
  const finalEnergy = energyLevel || (typeof analysis.energy === "string" ? analysis.energy : "Medium");

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Music Controls</h3>
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
            <TabsList>
              <TabsTrigger value="simple" disabled={disabled}>Simple</TabsTrigger>
              <TabsTrigger value="advanced" disabled={disabled}>Advanced</TabsTrigger>
            </TabsList>
          </Tabs>
          <PresetDropdown
            presets={savedPresets}
            currentPresetId={currentPresetId}
            onLoadPreset={onLoadPreset}
            onDeletePreset={onDeletePreset}
            onCreateNew={() => setPresetModalOpen(true)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Simple Mode */}
        <TabsContent value="simple" className="space-y-4 mt-4">
          <GenreSelect
            value={selectedGenre}
            onChange={onGenreChange}
            aiSuggestion={aiGenre}
            disabled={disabled}
          />

          <QuickInstrumentSelect
            selectedGenre={selectedGenre}
            selectedInstruments={selectedInstruments}
            onInstrumentsChange={onInstrumentsChange}
            disabled={disabled}
          />

          <div className="space-y-2">
            <Label htmlFor="vibe-text">Your Vibe</Label>
            <Textarea
              id="vibe-text"
              value={userVibeText}
              onChange={(e) => onVibeTextChange(e.target.value)}
              placeholder="Describe the vibe you want (optional)..."
              disabled={disabled}
              rows={3}
            />
          </div>
        </TabsContent>

        {/* Advanced Mode */}
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <GenreSelect
            value={selectedGenre}
            onChange={onGenreChange}
            aiSuggestion={aiGenre}
            disabled={disabled}
          />

          <div className="space-y-2">
            <Label htmlFor="vibe-text-advanced">Your Vibe</Label>
            <Textarea
              id="vibe-text-advanced"
              value={userVibeText}
              onChange={(e) => onVibeTextChange(e.target.value)}
              placeholder="Describe the vibe you want (optional)..."
              disabled={disabled}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Blend: {blendRatio}% your input</Label>
            </div>
            <Slider
              value={[blendRatio]}
              onValueChange={([value]) => onBlendRatioChange(value)}
              min={0}
              max={100}
              step={5}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>More AI</span>
              <span>More You</span>
            </div>
          </div>

          <InstrumentSelector
            selectedInstruments={selectedInstruments}
            onInstrumentsChange={onInstrumentsChange}
            disabled={disabled}
          />

          <div className="space-y-2">
            <Label>Energy</Label>
            <RadioGroup
              value={finalEnergy}
              onValueChange={onEnergyChange}
              disabled={disabled}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Low" id="energy-low" />
                <Label htmlFor="energy-low" className="cursor-pointer">Chill</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Medium" id="energy-medium" />
                <Label htmlFor="energy-medium" className="cursor-pointer">Moderate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="High" id="energy-high" />
                <Label htmlFor="energy-high" className="cursor-pointer">Upbeat</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Style: {styleLevel}</Label>
              <span className="text-xs text-muted-foreground">Controls production quality and era</span>
            </div>
            <Slider
              value={[styleLevel]}
              onValueChange={([value]) => onStyleLevelChange(value)}
              min={0}
              max={10}
              step={1}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Lo-fi / Vintage</span>
              <span>Cinematic / Modern</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vocals</Label>
            <RadioGroup
              value={vocalType}
              onValueChange={(value) => onVocalTypeChange(value as 'instrumental' | 'minimal-vocals' | 'vocal-focused')}
              disabled={disabled}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instrumental" id="vocal-instrumental" />
                <Label htmlFor="vocal-instrumental" className="cursor-pointer">🎵 Instrumental</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimal-vocals" id="vocal-minimal" />
                <Label htmlFor="vocal-minimal" className="cursor-pointer">🎤 Minimal Vocals</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vocal-focused" id="vocal-focused" />
                <Label htmlFor="vocal-focused" className="cursor-pointer">🎙️ Vocal-focused</Label>
              </div>
            </RadioGroup>
          </div>

          {onGenerateVariations && (
            <Button
              variant="default"
              onClick={onGenerateVariations}
              disabled={disabled}
              className="w-full gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate 3 Variations
            </Button>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setPresetModalOpen(true)}
              disabled={disabled}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Preset
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveAsDefault}
              disabled={disabled}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Set as Default
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <PresetSaveModal
        open={presetModalOpen}
        onOpenChange={setPresetModalOpen}
        onSave={handleSavePreset}
        currentState={{
          genre: selectedGenre || mapGeminiGenreToOption(aiGenre),
          instruments: selectedInstruments,
          energy: finalEnergy,
          blendRatio,
          vibeTemplate: userVibeText,
        }}
        existingPresets={savedPresets}
      />
    </div>
  );
}

