import { Music, Music2, Music3, Music4 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  imageUrl?: string;
}

export function LoadingState({ message = "Analyzing your vibe...", imageUrl }: LoadingStateProps) {
  const musicNotes = [Music, Music2, Music3, Music4];
  
  return (
    <div className="relative animate-fade-in-up">
      <div className="glass-card p-8 glow-primary">
        {imageUrl && (
          <div className="relative mb-8 max-w-md mx-auto">
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <img
                src={imageUrl}
                alt="Analyzing"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              
              {/* Floating music notes */}
              <div className="absolute inset-0 overflow-hidden">
                {musicNotes.map((Icon, i) => (
                  <div
                    key={i}
                    className="absolute animate-float text-primary"
                    style={{
                      left: `${20 + i * 20}%`,
                      top: `${30 + (i % 2) * 20}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${4 + i}s`,
                    }}
                  >
                    <Icon className="w-8 h-8 drop-shadow-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          {/* Waveform animation */}
          <div className="flex items-end justify-center gap-1 h-16 mb-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-primary to-secondary rounded-full animate-waveform"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: "30%",
                }}
              />
            ))}
          </div>

          <h3 className="text-2xl font-display font-semibold mb-2 animate-pulse-glow">
            {message}
          </h3>
          <p className="text-muted-foreground">
            Discovering the perfect soundtrack for your moment
          </p>
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary rounded-full animate-pulse-glow" />
      </div>
    </div>
  );
}
