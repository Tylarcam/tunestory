import { Share2, Twitter, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { Song } from "./SongCard";

interface ShareButtonsProps {
  song: Song;
  moodDescription?: string;
}

export function ShareButtons({ song, moodDescription }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🎵 TuneStory matched "${song.name}" by ${song.artist} to my photo vibe! ${moodDescription ? `\n\n${moodDescription}` : ""}`;

  const handleCopyLink = async () => {
    const text = `${shareText}\n\n${song.spotifyUrl}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Song info copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(song.spotifyUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const handleInstagramShare = () => {
    // Instagram doesn't have a direct share URL, so we copy and inform user
    handleCopyLink();
    toast({
      title: "Ready to share!",
      description: "Song info copied. Open Instagram and paste in your story!",
    });
  };

  const handleTikTokShare = () => {
    // TikTok doesn't have a direct share URL either
    handleCopyLink();
    toast({
      title: "Ready to share!",
      description: "Song info copied. Open TikTok and paste in your post!",
    });
  };

  return (
    <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
      <span className="text-sm text-muted-foreground mr-2">
        <Share2 className="w-4 h-4 inline mr-1" />
        Share
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstagramShare}
        className="border-border/50 hover:bg-primary/10 hover:border-primary/50"
      >
        <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        Instagram
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleTikTokShare}
        className="border-border/50 hover:bg-primary/10 hover:border-primary/50"
      >
        <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
        TikTok
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleTwitterShare}
        className="border-border/50 hover:bg-primary/10 hover:border-primary/50"
      >
        <Twitter className="w-4 h-4 mr-1.5" />
        X
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="border-border/50 hover:bg-primary/10 hover:border-primary/50"
      >
        {copied ? (
          <Check className="w-4 h-4 mr-1.5 text-green-500" />
        ) : (
          <Link2 className="w-4 h-4 mr-1.5" />
        )}
        Copy
      </Button>
    </div>
  );
}
