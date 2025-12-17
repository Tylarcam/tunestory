import { useState, useCallback } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LoadingState } from "@/components/LoadingState";
import { MoodDisplay, type MoodData } from "@/components/MoodDisplay";
import { SongCard, type Song } from "@/components/SongCard";
import { ShareButtons } from "@/components/ShareButtons";
import { RegenerateButton } from "@/components/RegenerateButton";
import { Music2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type AppState = "upload" | "analyzing" | "gathering" | "results";

const Index = () => {
  const [state, setState] = useState<AppState>("upload");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [moodData, setMoodData] = useState<MoodData | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleImageSelect = useCallback(async (file: File) => {
    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    
    // Start analysis
    setState("analyzing");
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const imageBase64 = await base64Promise;

      // Call analyze-image edge function
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

      // Get music recommendations
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
  }, []);

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
    if (!selectedImage) return;
    setPlayingId(null);
    handleImageSelect(selectedImage);
  }, [selectedImage, handleImageSelect]);

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
        <header className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20 glow-primary">
              <Music2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">
              TuneStory
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover the perfect soundtrack for your moments
          </p>
        </header>

        {/* Main content */}
        <main className="space-y-8">
          {state === "upload" && (
            <PhotoUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onClear={handleClear}
            />
          )}

          {(state === "analyzing" || state === "gathering") && (
            <LoadingState
              message={state === "analyzing" ? "Analyzing your vibe..." : "Finding your perfect tracks..."}
              imageUrl={imagePreviewUrl || undefined}
            />
          )}

          {state === "results" && (
            <div className="space-y-6">
              {/* Image preview with mood */}
              <div className="grid md:grid-cols-2 gap-6">
                {imagePreviewUrl && (
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
                
                {moodData && <MoodDisplay moodData={moodData} />}
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
                  Try a different photo
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
