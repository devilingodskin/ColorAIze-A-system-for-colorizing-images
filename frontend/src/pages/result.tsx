import { useRoute } from "wouter";
import { useImage } from "@/hooks/use-images";
import { ImageCompare } from "@/components/image-compare";
import { StatusBadge } from "@/components/status-badge";
import { Download, Share2, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Result() {
  const [, params] = useRoute("/result/:id");
  const id = parseInt(params?.id || "0");
  const { data: image, isLoading, error } = useImage(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Retrieving image data...</p>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Image Not Found</h2>
        <Link href="/gallery" className="text-primary hover:underline">Return to Gallery</Link>
      </div>
    );
  }

  const isProcessing = image.status === "pending" || image.status === "processing";
  const isFailed = image.status === "failed";
  const isComplete = image.status === "completed";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link href="/gallery" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Gallery
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold font-display">Result #{image.id}</h1>
            <StatusBadge status={image.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            Created on {new Date(image.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          {isComplete && (
            <a 
              href={image.colorizedUrl!} 
              download={`colorized-${image.id}.png`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
            >
              <Download className="w-4 h-4" /> Download Result
            </a>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl">
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Processing Image...</h3>
              <p className="text-muted-foreground max-w-md">
                Our neural network is analyzing the grayscale patterns and hallucinating color channels. This usually takes 5-10 seconds.
              </p>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-destructive">Colorization Failed</h3>
            <p className="text-muted-foreground max-w-md">
              {image.errorMessage || "An unexpected error occurred during processing. Please try again with a different image."}
            </p>
          </div>
        )}

        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <ImageCompare 
              beforeImage={image.originalUrl} 
              afterImage={image.colorizedUrl!} 
              className="w-full shadow-2xl rounded-xl border border-white/5"
            />
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Original Source</span>
                <a href={image.originalUrl} target="_blank" rel="noreferrer" className="text-sm font-mono truncate block hover:text-primary transition-colors">
                  View Source
                </a>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                 <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Processed Output</span>
                 <a href={image.colorizedUrl!} target="_blank" rel="noreferrer" className="text-sm font-mono truncate block hover:text-primary transition-colors">
                  View Full Resolution
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
