import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { PresetCard } from "./PresetCard";
import { InstrumentCategory } from "./InstrumentCategory";
import { CompatibilitySuggestions } from "./CompatibilitySuggestions";
import {
  getAllPresets,
  getAllCategories,
  validateInstrumentSelection,
  getCompatibleInstruments,
  findMatchingPreset,
  getInstrument,
  INSTRUMENT_CATEGORIES,
  type InstrumentPreset,
} from "@/lib/instrumentOptions";

interface InstrumentSelectorProps {
  selectedInstruments: string[];
  onInstrumentsChange: (instruments: string[]) => void;
  disabled?: boolean;
}

export function InstrumentSelector({
  selectedInstruments,
  onInstrumentsChange,
  disabled = false,
}: InstrumentSelectorProps) {
  // #region agent log
  console.log('[DEBUG] InstrumentSelector mount', { selectedInstruments, disabled });
  fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InstrumentSelector.tsx:25',message:'Component mount',data:{selectedInstruments,disabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch((e)=>console.error('[DEBUG] Log fetch failed', e));
  // #endregion
  const [instrumentView, setInstrumentView] = useState<"presets" | "custom">("presets");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [suggestedInstruments, setSuggestedInstruments] = useState<string[]>([]);

  // #region agent log
  let presets: ReturnType<typeof getAllPresets> = [];
  let categories: ReturnType<typeof getAllCategories> = [];
  try {
    presets = getAllPresets();
    categories = getAllCategories();
    console.log('[DEBUG] Data loaded', { presetsCount: presets.length, categoriesCount: categories.length, presets: presets.map(p => p.id), categories: categories.map(c => c.id) });
    fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InstrumentSelector.tsx:38',message:'Data loaded',data:{presetsCount:presets.length,categoriesCount:categories.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch((e)=>console.error('[DEBUG] Log fetch failed', e));
  } catch(e) {
    console.error('[DEBUG] InstrumentSelector: Error loading data', e);
    fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InstrumentSelector.tsx:38',message:'Data load error',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch((e)=>console.error('[DEBUG] Log fetch failed', e));
    // Variables already initialized to empty arrays above
  }
  // #endregion

  // Update suggestions when selection changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InstrumentSelector.tsx:39',message:'useEffect suggestions',data:{selectedInstruments},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const suggestions = getCompatibleInstruments(selectedInstruments);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InstrumentSelector.tsx:42',message:'Suggestions computed',data:{suggestionsCount:suggestions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    setSuggestedInstruments(suggestions.map(i => i.id));
  }, [selectedInstruments]);

  // Check for preset match on mount and when selection changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InstrumentSelector.tsx:45',message:'useEffect preset match',data:{selectedInstruments,instrumentView},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const matchingPreset = findMatchingPreset(selectedInstruments);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InstrumentSelector.tsx:47',message:'Preset match result',data:{matched:!!matchingPreset,presetId:matchingPreset?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (matchingPreset) {
      setActivePreset(matchingPreset.id);
      if (instrumentView === "custom") {
        setInstrumentView("presets");
      }
    } else {
      setActivePreset(null);
    }
  }, [selectedInstruments, instrumentView]);

  const handleSelectPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);
    onInstrumentsChange([...preset.instruments]);
    setValidationErrors([]);
  };

  const handleToggleInstrument = (instrumentId: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InstrumentSelector.tsx:66',message:'Toggle instrument',data:{instrumentId,selectedInstruments},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    const isSelected = selectedInstruments.includes(instrumentId);
    let newSelection: string[];

    if (isSelected) {
      // Remove instrument
      newSelection = selectedInstruments.filter(id => id !== instrumentId);
    } else {
      // Add instrument - check for category conflicts first
      const validation = validateInstrumentSelection([...selectedInstruments, instrumentId]);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/cc65279a-8083-4159-bde6-031c6d1349f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InstrumentSelector.tsx:75',message:'Validation result',data:{valid:validation.valid,errors:validation.errors},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      if (!validation.valid) {
        // Check if it's a category conflict
        const conflictError = validation.errors.find(e => e.type === 'category_conflict');
        if (conflictError) {
          // Replace existing instrument in same category
          const newInstrument = getInstrument(instrumentId);
          if (newInstrument) {
            const category = INSTRUMENT_CATEGORIES[newInstrument.category];
            if (category && !category.allowMultiple) {
              // Remove other instruments in same category
              newSelection = selectedInstruments.filter(id => {
                const inst = getInstrument(id);
                return !inst || inst.category !== newInstrument.category;
              });
              newSelection.push(instrumentId);
              setActivePreset(null); // Clear preset when customizing
            } else {
              newSelection = [...selectedInstruments, instrumentId];
            }
          } else {
            return; // Invalid instrument
          }
        } else {
          // Other validation error - show it
          setValidationErrors(validation.errors.map(e => e.message));
          return;
        }
      } else {
        newSelection = [...selectedInstruments, instrumentId];
      }
    }

    // Validate final selection
    const finalValidation = validateInstrumentSelection(newSelection);
    if (!finalValidation.valid) {
      setValidationErrors(finalValidation.errors.map(e => e.message));
      // Still allow the change, but show warning
    } else {
      setValidationErrors([]);
    }

    // Clear preset if user is customizing
    if (!isSelected) {
      setActivePreset(null);
    }

    onInstrumentsChange(newSelection);
  };

  const handleAddSuggestion = (instrumentId: string) => {
    if (selectedInstruments.includes(instrumentId)) return;
    
    const validation = validateInstrumentSelection([...selectedInstruments, instrumentId]);
    if (!validation.valid) {
      setValidationErrors(validation.errors.map(e => e.message));
      return;
    }

    setActivePreset(null); // Clear preset when adding suggestion
    onInstrumentsChange([...selectedInstruments, instrumentId]);
    setValidationErrors([]);
  };

  const handleDismissError = (index: number) => {
    setValidationErrors(errors => errors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Instruments</label>
        {instrumentView === "presets" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setInstrumentView("custom")}
            disabled={disabled}
          >
            Customize
          </Button>
        )}
        {instrumentView === "custom" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setInstrumentView("presets")}
            disabled={disabled}
          >
            ← Back to Presets
          </Button>
        )}
      </div>

      {/* Preset View */}
      {instrumentView === "presets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              selected={activePreset === preset.id}
              onSelect={handleSelectPreset}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Custom View */}
      {instrumentView === "custom" && (
        <div className="space-y-4">
          {categories.map((category) => (
            <InstrumentCategory
              key={category.id}
              category={category}
              selectedInstruments={selectedInstruments}
              onToggleInstrument={handleToggleInstrument}
              disabled={disabled}
            />
          ))}

          {/* Compatibility Suggestions */}
          {suggestedInstruments.length > 0 && (
            <CompatibilitySuggestions
              suggestions={getCompatibleInstruments(selectedInstruments)}
              onAddSuggestion={handleAddSuggestion}
              disabled={disabled}
            />
          )}
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-1">
          {validationErrors.map((error, index) => (
            <Alert key={index} variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-xs">{error}</span>
                <button
                  type="button"
                  onClick={() => handleDismissError(index)}
                  className="ml-2 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

