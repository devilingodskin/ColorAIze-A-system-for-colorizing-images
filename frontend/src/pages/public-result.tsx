import { useRoute } from "wouter";
import { ImageCompare } from "@/components/image-compare";
import { StatusBadge } from "@/components/status-badge";
import { ImageViewer } from "@/components/image-viewer";
import { Download, Share2, ArrowLeft, RefreshCw, AlertTriangle, Eye, Copy, ExternalLink, Maximize2, Info } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// API base URL
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string | undefined) || "http://localhost:8000";

interface PublicImage {
  id: number;
  originalUrl: string;
  colorizedUrl: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage: string | null;
  createdAt: string;
}

export default function PublicResult() {
  const [, params] = useRoute("/public/:token");
  const token = params?.token || "";
  const { toast } = useToast();
  const [image, setImage] = useState<PublicImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/${token}`);
        if (!res.ok) {
          throw new Error("Изображение не найдено");
        }
        const data = await res.json();
        setImage(data);
      } catch (err: any) {
        setError(err.message || "Ошибка загрузки");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchImage();
      // Poll for updates if processing
      const interval = setInterval(() => {
        fetchImage();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 animate-pulse">Загрузка данных изображения...</p>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">Изображение не найдено</h2>
        <p className="text-gray-600">Возможно, ссылка неверна или изображение было удалено.</p>
        <Link href="/" className="text-gray-900 hover:underline">Вернуться на главную</Link>
      </div>
    );
  }

  const isProcessing = image.status === "pending" || image.status === "processing";
  const isFailed = image.status === "failed";
  const isComplete = image.status === "completed";

  const handleViewOriginal = () => {
    setViewerImage(image.originalUrl);
    setViewerTitle("Оригинальное изображение");
    setViewerOpen(true);
  };

  const handleViewColorized = () => {
    if (image.colorizedUrl) {
      setViewerImage(image.colorizedUrl);
      setViewerTitle("Раскрашенное изображение");
      setViewerOpen(true);
    }
  };

  const handleDownload = (format: "jpg" | "png" = "jpg") => {
    if (!image.colorizedUrl) return;
    
    const link = document.createElement("a");
    link.href = image.colorizedUrl;
    link.download = `colorized-${image.id}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Ссылка скопирована!",
        description: "Публичная ссылка скопирована в буфер обмена",
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> На главную
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold font-display text-gray-900">Публичный просмотр</h1>
            <StatusBadge status={image.status} />
          </div>
          <p className="text-gray-600 text-sm">
            Создано {new Date(image.createdAt).toLocaleString('ru-RU')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isComplete && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2 bg-gray-900 text-white hover:bg-gray-800">
                    <Download className="w-4 h-4" /> Скачать
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload("jpg")}>
                    <Download className="w-4 h-4 mr-2" /> Скачать как JPG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload("png")}>
                    <Download className="w-4 h-4 mr-2" /> Скачать как PNG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" /> Просмотр
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleViewOriginal}>
                    <Maximize2 className="w-4 h-4 mr-2" /> Оригинал
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleViewColorized}>
                    <Maximize2 className="w-4 h-4 mr-2" /> Раскрашенное
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" /> Поделиться
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" /> Копировать ссылку
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="liquid-glass rounded-3xl p-6 md:p-8 shadow-2xl">
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-gray-900 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Обработка изображения...</h3>
              <p className="text-gray-600 max-w-md">
                Наша нейронная сеть анализирует черно-белые паттерны и добавляет цветовые каналы. Обычно это занимает 5-10 секунд.
              </p>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-red-500">Ошибка раскрашивания</h3>
            <p className="text-gray-600 max-w-md">
              {image.errorMessage || "Произошла неожиданная ошибка при обработке."}
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
              className="w-full shadow-2xl rounded-2xl border border-gray-200"
            />

            {/* Image Info */}
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Информация об изображении</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>ID: #{image.id}</p>
                    <p>Создано: {new Date(image.createdAt).toLocaleString('ru-RU')}</p>
                    <p>Статус: {image.status === "completed" ? "Обработано" : image.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Image Viewer Modal */}
        {viewerImage && (
          <ImageViewer
            imageUrl={viewerImage}
            isOpen={viewerOpen}
            onClose={() => {
              setViewerOpen(false);
              setViewerImage(null);
            }}
            title={viewerTitle}
            filename={`${viewerTitle.toLowerCase().replace(/\s+/g, "-")}-${image.id}.jpg`}
          />
        )}
      </div>
    </div>
  );
}

