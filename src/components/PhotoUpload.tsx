import { useState, useCallback, useEffect } from "react";
import { Upload, Image as ImageIcon, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onImagesSelect: (files: File[]) => void;
  selectedImages: File[];
  selectedImageIndex: number | null;
  onImageSelect: (index: number) => void;
  onClear: () => void;
}

export function PhotoUpload({ onImagesSelect, selectedImages, selectedImageIndex, onImageSelect, onClear }: PhotoUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Generate preview URLs for all selected images
  useEffect(() => {
    const urls = selectedImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    // Cleanup function to revoke old URLs
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      onImagesSelect(imageFiles);
    }
  }, [onImagesSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClear = () => {
    // Cleanup all preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    onClear();
  };

  // Gallery view for 2+ photos
  if (selectedImages.length > 1 && previewUrls.length > 1) {
    const selectedPreviewUrl = selectedImageIndex !== null ? previewUrls[selectedImageIndex] : null;
    
    return (
      <div className="space-y-4 animate-fade-in-up">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="font-display font-semibold text-lg mb-1">
              Select a photo
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose one photo to generate music from
            </p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
            {selectedImages.map((file, index) => {
              const isSelected = selectedImageIndex === index;
              return (
                <div
                  key={index}
                  onClick={() => onImageSelect(index)}
                  className={cn(
                    "relative flex-shrink-0 w-32 h-32 cursor-pointer rounded-xl overflow-hidden transition-all duration-300",
                    isSelected 
                      ? "ring-2 ring-primary glow-primary scale-105" 
                      : "ring-2 ring-border hover:ring-primary/50 hover:scale-[1.02]"
                  )}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <img
                    src={previewUrls[index]}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="p-2 rounded-full bg-primary">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected photo preview */}
        {selectedImageIndex !== null && selectedPreviewUrl && (
          <div className="relative animate-fade-in-up">
            <div className="glass-card p-2 glow-primary">
              <div className="relative aspect-square max-w-md mx-auto overflow-hidden rounded-xl">
                <img
                  src={selectedPreviewUrl}
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
        )}
      </div>
    );
  }

  // Single photo view (existing behavior)
  if (selectedImages.length === 1 && previewUrls.length === 1) {
    return (
      <div className="relative animate-fade-in-up">
        <div className="glass-card p-2 glow-primary">
          <div className="relative aspect-square max-w-md mx-auto overflow-hidden rounded-xl">
            <img
              src={previewUrls[0]}
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
        multiple
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
