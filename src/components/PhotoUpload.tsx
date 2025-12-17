import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onClear: () => void;
}

export function PhotoUpload({ onImageSelect, selectedImage, onClear }: PhotoUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      onImageSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClear();
  };

  if (selectedImage && previewUrl) {
    return (
      <div className="relative animate-fade-in-up">
        <div className="glass-card p-2 glow-primary">
          <div className="relative aspect-square max-w-md mx-auto overflow-hidden rounded-xl">
            <img
              src={previewUrl}
              alt="Selected"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleClear}
              className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative group cursor-pointer transition-all duration-300 animate-fade-in-up",
        "glass-card p-12 rounded-3xl border-2 border-dashed",
        isDragActive
          ? "border-primary bg-primary/10 glow-primary"
          : "border-border hover:border-primary/50 hover:bg-card/80"
      )}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-6 text-center">
        <div className={cn(
          "p-6 rounded-full transition-all duration-300",
          isDragActive ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
        )}>
          {isDragActive ? (
            <Upload className="w-12 h-12 text-primary animate-pulse" />
          ) : (
            <ImageIcon className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-display font-semibold mb-2">
            {isDragActive ? "Drop your photo here" : "Drop your photo here"}
          </h3>
          <p className="text-muted-foreground">
            or <span className="text-primary underline underline-offset-4">browse files</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            JPG, PNG, WEBP supported
          </p>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
