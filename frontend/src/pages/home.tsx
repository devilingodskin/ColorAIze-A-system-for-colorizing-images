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
      const file = acceptedFiles[0];
      
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        return; // Error will be shown by toast
      }
      
      uploadImage(file, {
        onSuccess: (data) => {
          if (data && data.id) {
            setLocation(`/result/${data.id}`);
          }
        },
        onError: (error) => {
          // Error toast is already shown by useUploadImage
          console.error("Upload failed:", error);
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
    <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 sm:pt-8 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-4 text-gray-900">
            Восстановите историю <br className="hidden sm:block" />
            <span className="text-gradient">с точностью ИИ</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Раскрашивание черно-белых фотографий с помощью глубокого обучения.
            Загрузите ваши старые снимки и увидите их в цвете.
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
            "relative group overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[250px] sm:min-h-[300px] flex items-center justify-center liquid-glass mx-4 sm:mx-0",
            isDragActive 
              ? "border-gray-400 bg-white/90 shadow-2xl scale-[1.01]" 
              : "border-gray-300 hover:border-gray-400 hover:bg-white/80"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="text-center p-8 space-y-4 relative z-10">
            <div className={clsx(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 mb-6",
              isDragActive ? "bg-gray-900 text-white shadow-lg" : "bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white"
            )}>
              {isPending ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold font-display text-gray-900">
                {isDragActive ? "Отпустите для раскрашивания" : "Загрузить изображение"}
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Перетащите черно-белое фото сюда или нажмите для выбора файла.
                Поддерживаются JPG, JPEG, PNG.
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
        {[
          {
            icon: Zap,
            title: "Мгновенная обработка",
            desc: "Оптимизированные нейронные сети для быстрой обработки."
          },
          {
            icon: ShieldCheck,
            title: "Высокое качество",
            desc: "Надежные и воспроизводимые результаты."
          },
          {
            icon: ImageIcon,
            title: "Точность",
            desc: "Сохранение оригинального разрешения с реалистичными цветами."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className="p-6 rounded-2xl border border-gray-200 liquid-glass hover:shadow-xl transition-all duration-300"
          >
            <feature.icon className="w-10 h-10 text-gray-900 mb-4" />
            <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
