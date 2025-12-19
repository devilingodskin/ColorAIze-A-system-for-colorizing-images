import { useImages } from "@/hooks/use-images";
import { Link } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { ArrowRight, ImageOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Gallery() {
  const { data: images, isLoading, error } = useImages();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">Failed to load gallery data.</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
          <ImageOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-display">No Images Yet</h2>
          <p className="text-muted-foreground mt-2">Upload your first image to start building your gallery.</p>
        </div>
        <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Start Uploading
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Gallery</h1>
          <p className="text-muted-foreground mt-1">Archive of processed images</p>
        </div>
        <Link href="/" className="hidden sm:flex items-center gap-2 text-primary hover:underline">
          New Upload <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image, i) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/result/${image.id}`} className="group block h-full">
              <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full flex flex-col">
                <div className="aspect-square relative overflow-hidden bg-muted/30">
                  <img
                    src={image.colorizedUrl || image.originalUrl}
                    alt="Gallery thumbnail"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <StatusBadge status={image.status} />
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>ID: #{image.id}</span>
                    <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
