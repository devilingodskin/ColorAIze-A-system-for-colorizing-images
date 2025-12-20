import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const share = async (options: {
    title?: string;
    text?: string;
    url?: string;
    imageUrl?: string;
  }) => {
    setIsSharing(true);
    try {
      const shareUrl = options.url || window.location.href;
      const shareText = options.text || "Посмотрите на это раскрашенное изображение!";
      const shareTitle = options.title || "Раскрашенное изображение";

      // Try Web Share API first (mobile devices)
      if (navigator.share && navigator.canShare) {
        const shareData: ShareData = {
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        };

        // Check if we can share with image (some browsers support it)
        if (options.imageUrl && navigator.canShare({ files: [] as any })) {
          try {
            // Convert image URL to File
            const response = await fetch(options.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], "colorized-image.jpg", { type: blob.type });
            
            const shareDataWithFile: ShareData & { files?: File[] } = {
              ...shareData,
              files: [file],
            };

            if (navigator.canShare(shareDataWithFile as any)) {
              await navigator.share(shareDataWithFile as any);
              toast({
                title: "Успешно!",
                description: "Изображение отправлено",
              });
              return;
            }
          } catch (e) {
            // Fallback to URL sharing
          }
        }

        // Share with URL only
        await navigator.share(shareData);
        toast({
          title: "Успешно!",
          description: "Ссылка отправлена",
        });
        return;
      }

      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Ссылка скопирована!",
        description: "Теперь вы можете поделиться ею",
      });
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== "AbortError") {
        // Copy to clipboard as fallback
        try {
          await navigator.clipboard.writeText(options.url || window.location.href);
          toast({
            title: "Ссылка скопирована!",
            description: "Теперь вы можете поделиться ею",
          });
        } catch (clipboardError) {
          toast({
            title: "Ошибка",
            description: "Не удалось поделиться",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return { share, isSharing };
}

