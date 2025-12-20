import { useState, useRef, useEffect } from "react";
import { MoveHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export function ImageCompare({ beforeImage, afterImage, className = "" }: ImageCompareProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(percentage);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove as any);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove as any);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-video overflow-hidden rounded-lg sm:rounded-xl bg-muted/50 border border-border select-none cursor-ew-resize group ${className}`}
      onMouseDown={handleMouseDown}
    >
      {/* Before Image (Background) */}
      <img 
        src={beforeImage} 
        alt="Original" 
        className="absolute inset-0 w-full h-full object-contain bg-black/50"
        draggable={false}
      />
      
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono text-white/80 border border-white/10 z-10">
        ORIGINAL
      </div>

      {/* After Image (Foreground - Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={afterImage} 
          alt="Colorized" 
          className="absolute inset-0 w-full h-full object-contain bg-black/50"
          draggable={false}
        />
        <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono text-white border border-white/10 z-10">
          COLORIZED
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-black transition-transform group-active:scale-110">
          <MoveHorizontal className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
