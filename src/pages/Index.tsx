import { useState, useCallback, useEffect } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LoadingState } from "@/components/LoadingState";
import { MoodDisplay, type MoodData } from "@/components/MoodDisplay";
import { SongCard, type Song } from "@/components/SongCard";
import { ShareButtons } from "@/components/ShareButtons";
import { RegenerateButton } from "@/components/RegenerateButton";
import { VibeModeToggle, type VibeMode } from "@/components/VibeModeToggle";
import { SpotifyAuth } from "@/components/SpotifyAuth";
import { PlaylistSelector } from "@/components/PlaylistSelector";
import { Music2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type AppState = "upload" | "analyzing" | "gathering" | "results";

const Index = () => {
  const [state, setState] = useState<AppState>("upload");
  const [vibeMode, setVibeMode] = useState<VibeMode>("photo");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [moodData, setMoodData] = useState<MoodData | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  // Music mode state
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | "liked">("liked");

  const handleImageSelect = useCallback(async (file: File) => {
    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    
    setState("analyzing");
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const imageBase64 = await base64Promise;

      const analyzeResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64 }),
        }
      );

      if (!analyzeResponse.ok) {
        const error = await analyzeResponse.json();
        throw new Error(error.error || "Failed to analyze image");
      }

      const analysis = await analyzeResponse.json();
      setMoodData({
        mood: analysis.mood,
        energy: analysis.energy,
        genres: analysis.genres,
        description: analysis.description,
      });

      setState("gathering");

      // Validate that we have the required data
      if (!analysis.searchTerms || !Array.isArray(analysis.searchTerms) || analysis.searchTerms.length === 0) {
        console.warn("No searchTerms in analysis, using fallback");
        analysis.searchTerms = [`${analysis.mood || "music"} ${analysis.genres?.[0] || ""}`.trim()];
      }

      const recsResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            searchTerms: analysis.searchTerms,
            genres: analysis.genres,
            mood: analysis.mood,
            energy: analysis.energy,
            visualElements: analysis.visualElements || null, // Pass visual elements if available
          }),
        }
      );

      if (!recsResponse.ok) {
        const error = await recsResponse.json();
        throw new Error(error.error || "Failed to get recommendations");
      }

      const { recommendations } = await recsResponse.json();
      setSongs(recommendations);
      setState("results");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setState("upload");
    }
  }, []);

  const handleMusicAnalysis = useCallback(async () => {
    if (!spotifyToken) {
      toast({
        title: "Connect Spotify",
        description: "Please connect your Spotify account first",
        variant: "destructive",
      });
      return;
    }

    setState("analyzing");

    try {
      const analyzeResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            accessToken: spotifyToken,
            playlistId: selectedPlaylist === "liked" ? null : selectedPlaylist,
          }),
        }
      );

      if (!analyzeResponse.ok) {
        const error = await analyzeResponse.json();
        throw new Error(error.error || "Failed to analyze music");
      }

      const analysis = await analyzeResponse.json();
      setMoodData({
        mood: analysis.mood,
        energy: analysis.energy,
        genres: analysis.genres,
        description: analysis.description,
      });

      setState("gathering");

      const recsResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            searchTerms: analysis.searchTerms,
            genres: analysis.genres,
            mood: analysis.mood,
            energy: analysis.energy,
          }),
        }
      );

      if (!recsResponse.ok) {
        const error = await recsResponse.json();
        throw new Error(error.error || "Failed to get recommendations");
      }

      const { recommendations } = await recsResponse.json();
      setSongs(recommendations);
      setState("results");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setState("upload");
    }
  }, [spotifyToken, selectedPlaylist]);

  const handleClear = useCallback(() => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setMoodData(null);
    setSongs([]);
    setPlayingId(null);
    setState("upload");
  }, [imagePreviewUrl]);

  const handleRegenerate = useCallback(async () => {
    setPlayingId(null);
    if (vibeMode === "photo" && selectedImage) {
      handleImageSelect(selectedImage);
    } else if (vibeMode === "music") {
      handleMusicAnalysis();
    }
  }, [vibeMode, selectedImage, handleImageSelect, handleMusicAnalysis]);

  const handleModeChange = (mode: VibeMode) => {
    if (state === "results") {
      handleClear();
    }
    setVibeMode(mode);
  };

  const handlePlay = (id: string) => {
    setPlayingId(id);
  };

  const handlePause = () => {
    setPlayingId(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20 glow-primary">
              <Music2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">
              TuneStory
            </h1>
          </div>
          <p className="text-muted-foreground text-lg mb-6">
            Discover the perfect soundtrack for your moments
          </p>
          
          {/* Mode Toggle */}
          <VibeModeToggle
            mode={vibeMode}
            onModeChange={handleModeChange}
            disabled={state === "analyzing" || state === "gathering"}
          />
        </header>

        {/* Main content */}
        <main className="space-y-6">
          {/* Photo Mode */}
          {vibeMode === "photo" && state === "upload" && (
            <PhotoUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onClear={handleClear}
            />
          )}

          {/* Music Mode */}
          {vibeMode === "music" && state === "upload" && (
            <div className="space-y-6 animate-fade-in-up">
              <SpotifyAuth
                onAuthChange={setSpotifyToken}
              />
              
              {spotifyToken && (
                <>
                  <PlaylistSelector
                    accessToken={spotifyToken}
                    onSelectionChange={setSelectedPlaylist}
                    disabled={state !== "upload"}
                  />
                  
                  <Button
                    onClick={handleMusicAnalysis}
                    className="w-full py-6 text-lg font-semibold glow-primary"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze My Music
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Loading States */}
          {(state === "analyzing" || state === "gathering") && (
            <LoadingState
              message={state === "analyzing" ? "Analyzing your vibe..." : "Finding your perfect tracks..."}
              imageUrl={vibeMode === "photo" ? imagePreviewUrl || undefined : undefined}
            />
          )}

          {/* Results */}
          {state === "results" && (
            <div className="space-y-6">
              {/* Image preview with mood (photo mode) */}
              <div className="grid md:grid-cols-2 gap-6">
                {vibeMode === "photo" && imagePreviewUrl && (
                  <div className="glass-card p-2 animate-fade-in-up">
                    <div className="aspect-square rounded-xl overflow-hidden">
                      <img
                        src={imagePreviewUrl}
                        alt="Your photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {moodData && (
                  <div className={vibeMode === "music" ? "md:col-span-2" : ""}>
                    <MoodDisplay moodData={moodData} />
                  </div>
                )}
              </div>

              {/* Song recommendations */}
              <div className="space-y-4">
                <h2 className="font-display font-semibold text-xl">
                  Your Soundtrack
                </h2>
                
                {songs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index}
                    isPlaying={playingId === song.id}
                    onPlay={() => handlePlay(song.id)}
                    onPause={handlePause}
                  />
                ))}
              </div>

              {/* Share and regenerate */}
              {songs.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
                  <ShareButtons
                    song={songs[0]}
                    moodDescription={moodData?.description}
                  />
                  <RegenerateButton
                    onClick={handleRegenerate}
                    isLoading={state !== "results"}
                  />
                </div>
              )}

              {/* Start over */}
              <div className="text-center pt-4">
                <button
                  onClick={handleClear}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  {vibeMode === "photo" ? "Try a different photo" : "Analyze different music"}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-muted-foreground">
          <p>Powered by AI vision and Spotify</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
