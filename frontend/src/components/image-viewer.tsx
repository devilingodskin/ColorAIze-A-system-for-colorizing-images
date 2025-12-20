import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Download, Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ImageViewerProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  filename?: string;
}

export function ImageViewer({ 
  imageUrl, 
  isOpen, 
  onClose, 
  title = "Изображение",
  filename = "image.jpg"
}: ImageViewerProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      // Convert data URL to blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      
      setCopied(true);
      toast({
        title: "Успешно!",
        description: "Изображение скопировано в буфер обмена",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);
      // Fallback: copy URL
      try {
        await navigator.clipboard.writeText(imageUrl);
        setCopied(true);
        toast({
          title: "Ссылка скопирована",
          description: "URL изображения скопирован в буфер обмена",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardErr) {
        toast({
          title: "Ошибка",
          description: "Не удалось скопировать",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, "_blank");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="relative w-full h-full flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Скопировано!" : "Копировать"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Скачать
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNewTab}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Открыть
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="gap-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4 min-h-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ imageRendering: "high-quality" }}
                onError={(e) => {
                  console.error("Failed to load image:", imageUrl);
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EОшибка загрузки изображения%3C/text%3E%3C/svg%3E";
                }}
              />
            ) : (
              <div className="text-gray-500">Изображение не загружено</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

