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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Не удалось загрузить галерею.</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
          <ImageOff className="w-10 h-10 text-gray-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900">Пока нет изображений</h2>
          <p className="text-gray-600 mt-2">Загрузите первое изображение, чтобы начать создавать галерею.</p>
        </div>
        <Link href="/" className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
          Начать загрузку
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">Галерея</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Архив обработанных изображений</p>
        </div>
        <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm sm:text-base shadow-lg">
          Новая загрузка <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {images.map((image, i) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/result/${image.id}`} className="group block h-full">
              <div className="liquid-glass rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
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
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>ID: #{image.id}</span>
                    <span>{new Date(image.createdAt).toLocaleDateString('ru-RU')}</span>
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
