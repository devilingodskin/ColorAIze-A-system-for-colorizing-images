import { useCallback } from "react";
import { useLocation } from "wouter";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon, Zap, ShieldCheck } from "lucide-react";
import { useUploadImage } from "@/hooks/use-images";
import { motion } from "framer-motion";
import { clsx } from "clsx";

export default function Home() {
  const [, setLocation] = useLocation();
  const { mutate: uploadImage, isPending } = useUploadImage();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadImage(acceptedFiles[0], {
        onSuccess: (data) => {
          setLocation(`/result/${data.id}`);
        },
      });
    }
  }, [uploadImage, setLocation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': []
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="max-w-5xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Restore History with <br />
            <span className="text-gradient">Neural Precision</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Industrial-grade image colorization powered by deep learning.
            Upload your black & white photos and watch them come to life instantly.
          </p>
        </motion.div>
      </section>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div
          {...getRootProps()}
          className={clsx(
            "relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[300px] flex items-center justify-center bg-card/30 backdrop-blur-sm",
            isDragActive 
              ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-[1.02]" 
              : "border-border hover:border-primary/50 hover:bg-card/50"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="text-center p-8 space-y-4 relative z-10">
            <div className={clsx(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 mb-6",
              isDragActive ? "bg-primary text-white" : "bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-white"
            )}>
              {isPending ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold font-display">
                {isDragActive ? "Drop to Colorize" : "Upload Image"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Drag & drop your B&W photo here, or click to browse files.
                Supports JPG, JPEG, PNG.
              </p>
            </div>
          </div>

          {/* Background Grid Decoration */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
          />
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: Zap,
            title: "Instant Processing",
            desc: "Powered by optimized neural networks for low-latency inference."
          },
          {
            icon: ShieldCheck,
            title: "Industrial Grade",
            desc: "Designed for high reliability and reproducible results."
          },
          {
            icon: ImageIcon,
            title: "High Fidelity",
            desc: "Preserves original resolution while adding realistic color channels."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className="p-6 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <feature.icon className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
