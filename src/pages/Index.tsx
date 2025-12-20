import { useState, useCallback, useRef, useEffect } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LoadingState } from "@/components/LoadingState";
import { MoodDisplay, type MoodData } from "@/components/MoodDisplay";
import { SongCard, type Song } from "@/components/SongCard";
import { ShareButtons } from "@/components/ShareButtons";
import { RegenerateButton } from "@/components/RegenerateButton";
import { VibeModeToggle, type VibeMode } from "@/components/VibeModeToggle";
import { MusicModeToggle, type MusicMode } from "@/components/MusicModeToggle";
import { GeneratedMusicCard } from "@/components/GeneratedMusicCard";
import { SpotifyAuth } from "@/components/SpotifyAuth";
import { PlaylistSelector } from "@/components/PlaylistSelector";
import { MusicSourceSelector } from "@/components/MusicSourceSelector";
import { Music2, Sparkles, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";

type AppState = "upload" | "source-select" | "analyzing" | "gathering" | "results";
type MusicSourceType = "random" | "playlist";

interface GeneratedTrack {
  success: boolean;
  audioUrl: string;
  prompt: string;
  metadata: {
    model: string;
    duration: number;
    status: string;
    framework?: string;
  };
}

const Index = () => {
  const [state, setState] = useState<AppState>("upload");
  const [vibeMode, setVibeMode] = useState<VibeMode>("photo");
  const [musicMode, setMusicMode] = useState<MusicMode>("discover");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [moodData, setMoodData] = useState<MoodData | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [generatedTrack, setGeneratedTrack] = useState<GeneratedTrack | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<{
    mood: string;
    energy: number | string;
    genres: string[];
    tempo_bpm?: number;
    description?: string;
    setting?: string;
    time_of_day?: string;
    visualElements?: {
      colors?: string[];
      instruments?: string[];
      setting?: string;
      timeOfDay?: string;
    };
  } | null>(null); // Store full analysis for regeneration
  
  // Music mode state
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | "liked">("liked");
  
  // Spotify Web Playback SDK
  const spotifyPlayer = useSpotifyPlayer(spotifyToken);
  
  // Track which source was used for regeneration
  const lastSourceRef = useRef<{ type: MusicSourceType; token?: string; playlist?: string | "liked" }>({ type: "random" });

  // Called when image is selected - now goes to source selection
  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setState("source-select");
  }, []);

  // Analyze image and get random recommendations
  const analyzeImageAndGetRandom = useCallback(async () => {
    if (!selectedImage) return;
    
    lastSourceRef.current = { type: "random" };
    setState("analyzing");
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
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
  }, [selectedImage]);

  // Generate music using Supabase function (Hugging Face API) for real music
  const handleGenerateMusic = useCallback(async (analysis: {
    mood: string;
    energy: number | string;
    genres: string[];
    tempo_bpm?: number;
    description?: string;
    setting?: string;
    time_of_day?: string;
    visualElements?: {
      colors?: string[];
      instruments?: string[];
      setting?: string;
      timeOfDay?: string;
    };
  }) => {
    setIsGenerating(true);
    setState("gathering");
    
    try {
      // Ensure energy is a string for the edge function
      const energyStr = typeof analysis.energy === 'number'
        ? analysis.energy >= 7 ? 'High' : analysis.energy >= 4 ? 'Medium' : 'Low'
        : analysis.energy || 'Medium';

      // Call Supabase function directly with analysis data
      // This uses Modal API for AudioCraft MusicGen generation
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            mood: analysis.mood,
            energy: energyStr,
            genres: analysis.genres,
            tempo_bpm: analysis.tempo_bpm || 120,
            description: analysis.description || '',
            setting: analysis.visualElements?.setting || analysis.setting || '',
            time_of_day: analysis.visualElements?.timeOfDay || analysis.time_of_day || '',
            visualElements: analysis.visualElements || {}
          }),
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const text = await response.text();
          errorData = { error: text || `HTTP ${response.status} error` };
        }
        
        console.error('Generation API error:', response.status, errorData);
        
        // Handle retryable errors (503 - model loading)
        if (response.status === 503 || errorData.retryable) {
          toast({
            title: "Model Loading",
            description: errorData.error || errorData.details || "Model is loading. Please try again in 20-30 seconds.",
            variant: "default",
          });
          setState("source-select");
          return;
        }

        // Handle specific error cases
        if (response.status === 401) {
          throw new Error(errorData.error || errorData.details || "Invalid API key. Please check Hugging Face API key configuration in Supabase.");
        }

        if (response.status === 404) {
          throw new Error(errorData.error || errorData.details || "Model not found. MusicGen may not be available via Inference API.");
        }
        
        throw new Error(errorData.error || errorData.details || `Generation failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        console.error('Generation failed:', data);
        throw new Error(data.error || data.details || "Failed to generate music");
      }

      // Supabase function returns audioUrl directly (data URL)
      const trackData: GeneratedTrack = {
        success: true,
        audioUrl: data.audioUrl,
        prompt: data.prompt,
        metadata: {
          model: data.metadata?.model || 'AudioCraft MusicGen Large',
          duration: data.metadata?.duration || 30,
          status: 'generated',
          framework: data.metadata?.framework || 'AudioCraft'
        }
      };

      setGeneratedTrack(trackData);
      setSongs([]); // Clear songs when generating
      setState("results");
      toast({
        title: "Music Generated!",
        description: "Your AI-generated track is ready to play.",
      });

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate music. Please try again.",
        variant: "destructive",
      });
      setState("source-select");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Analyze image and filter from user's playlist
  const analyzeImageAndFilterPlaylist = useCallback(async (accessToken: string, playlistId: string | "liked") => {
    if (!selectedImage) return;
    
    lastSourceRef.current = { type: "playlist", token: accessToken, playlist: playlistId };
    setState("analyzing");
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });
      const imageBase64 = await base64Promise;

      // First analyze the image
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
      setLastAnalysis(analysis);
      setMoodData({
        mood: analysis.mood,
        energy: analysis.energy,
        genres: analysis.genres,
        description: analysis.description,
      });

      // Route to either Discover or Generate based on musicMode
      if (musicMode === "generate") {
        await handleGenerateMusic(analysis);
      } else {
        setState("gathering");

        // Get recommendations from user's playlist
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
              // Include Spotify token and playlist for filtering
              spotifyAccessToken: accessToken,
              playlistId: playlistId === "liked" ? null : playlistId,
              useUserLibrary: true,
            }),
          }
        );

        if (!recsResponse.ok) {
          const error = await recsResponse.json();
          throw new Error(error.error || "Failed to get recommendations");
        }

        const { recommendations } = await recsResponse.json();
        setSongs(recommendations);
        setGeneratedTrack(null); // Clear generated track when switching to discover
        setState("results");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setState("upload");
    }
  }, [selectedImage, musicMode, handleGenerateMusic]);

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
    setGeneratedTrack(null);
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
    if (vibeMode === "photo") {
      if (musicMode === "generate" && lastAnalysis) {
        await handleGenerateMusic(lastAnalysis);
      } else {
        const { type, token, playlist } = lastSourceRef.current;
        if (type === "playlist" && token && playlist) {
          analyzeImageAndFilterPlaylist(token, playlist);
        } else {
          analyzeImageAndGetRandom();
        }
      }
    } else if (vibeMode === "music") {
      handleMusicAnalysis();
    }
  }, [vibeMode, musicMode, lastAnalysis, handleGenerateMusic, analyzeImageAndGetRandom, analyzeImageAndFilterPlaylist, handleMusicAnalysis]);

  const handleModeChange = (mode: VibeMode) => {
    if (state === "results" || state === "source-select") {
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
          {/* Photo Mode - Upload */}
          {vibeMode === "photo" && state === "upload" && (
            <PhotoUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onClear={handleClear}
            />
          )}

          {/* Photo Mode - Source Selection */}
          {vibeMode === "photo" && state === "source-select" && imagePreviewUrl && (
            <div className="space-y-4">
              {/* Music Mode Toggle (Discover vs Generate) */}
              <div className="flex justify-center">
                <MusicModeToggle
                  mode={musicMode}
                  onModeChange={(newMode) => {
                    setMusicMode(newMode);
                  }}
                  disabled={false}
                />
              </div>
              
              {musicMode === "discover" && (
                <MusicSourceSelector
                  imagePreviewUrl={imagePreviewUrl}
                  onSelectRandom={analyzeImageAndGetRandom}
                  onSelectPlaylist={analyzeImageAndFilterPlaylist}
                />
              )}
              
              {musicMode === "generate" && (
                <div className="glass-card p-6 text-center space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden mb-4">
                    <img
                      src={imagePreviewUrl}
                      alt="Your photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      if (!selectedImage) return;
                      lastSourceRef.current = { type: "random" };
                      setState("analyzing");
                      
                      try {
                        const reader = new FileReader();
                        const base64Promise = new Promise<string>((resolve) => {
                          reader.onload = () => resolve(reader.result as string);
                          reader.readAsDataURL(selectedImage);
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
                        setLastAnalysis(analysis);
                        setMoodData({
                          mood: analysis.mood,
                          energy: analysis.energy,
                          genres: analysis.genres,
                          description: analysis.description,
                        });
                        await handleGenerateMusic(analysis);
                      } catch (error) {
                        console.error("Error:", error);
                        toast({
                          title: "Something went wrong",
                          description: error instanceof Error ? error.message : "Please try again",
                          variant: "destructive",
                        });
                        setState("source-select");
                      }
                    }}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    size="lg"
                    disabled={isGenerating}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {isGenerating ? "Generating Music..." : "Generate AI Music"}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Create original music using AudioCraft MusicGen (30-60 seconds, first request may take longer)
                  </p>
                </div>
              )}
            </div>
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
              message={
                state === "analyzing" 
                  ? "Analyzing your vibe..." 
                  : musicMode === "generate"
                    ? "Generating your AI music... (30-60 seconds, first request may take longer)"
                    : "Finding your perfect tracks..."
              }
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

              {/* Generated Music (Generate Mode) */}
              {vibeMode === "photo" && musicMode === "generate" && generatedTrack && (
                <GeneratedMusicCard
                  audioUrl={generatedTrack.audioUrl}
                  prompt={generatedTrack.prompt}
                  metadata={generatedTrack.metadata}
                  onRegenerate={() => lastAnalysis && handleGenerateMusic(lastAnalysis)}
                />
              )}

              {/* Song recommendations (Discover Mode) */}
              {musicMode === "discover" && songs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-semibold text-xl">
                      Your Soundtrack
                    </h2>
                    {spotifyPlayer.isReady && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Full Playback Active
                      </span>
                    )}
                  </div>
                  
                  {songs.map((song, index) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      index={index}
                      isPlaying={playingId === song.id}
                      onPlay={() => handlePlay(song.id)}
                      onPause={handlePause}
                      spotifyPlayer={spotifyPlayer.isReady ? {
                        isReady: spotifyPlayer.isReady,
                        currentTrack: spotifyPlayer.currentTrack,
                        progress: spotifyPlayer.progress,
                        duration: spotifyPlayer.duration,
                        play: spotifyPlayer.play,
                        pause: spotifyPlayer.pause,
                        isPlaying: spotifyPlayer.isPlaying,
                      } : undefined}
                      useSpotifySDK={!!spotifyToken && spotifyPlayer.isReady}
                    />
                  ))}
                </div>
              )}

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
