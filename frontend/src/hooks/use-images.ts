import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getApiSessionId } from "@/lib/session";

// API base URL
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string | undefined) || "http://localhost:8000";

/**
 * Get headers with session ID for API requests.
 */
function getApiHeaders(): HeadersInit {
  return {
    "X-Session-ID": getApiSessionId(),
  };
}

// Image type
export interface Image {
  id: number;
  originalUrl: string;
  colorizedUrl: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage: string | null;
  createdAt: string;
  publicToken?: string | null;
}

// Fetch all images
export function useImages() {
  return useQuery({
    queryKey: ["images"],
    queryFn: async (): Promise<Image[]> => {
      const res = await fetch(`${API_BASE_URL}/api/images`, {
        headers: getApiHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session required. Please refresh the page.");
        }
        throw new Error("Failed to fetch images");
      }
      return await res.json();
    },
    // Refresh occasionally to check for updates
    refetchInterval: 5000, 
  });
}

// Fetch single image with smart polling
export function useImage(id: number) {
  return useQuery({
    queryKey: ["images", id],
    queryFn: async (): Promise<Image> => {
      const res = await fetch(`${API_BASE_URL}/api/images/${id}`, {
        headers: getApiHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session required. Please refresh the page.");
        }
        if (res.status === 404) {
          throw new Error("Image not found or access denied");
        }
        throw new Error("Failed to fetch image");
      }
      return await res.json();
    },
    // Poll faster if status is pending or processing
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 1000 : false;
    },
  });
}

// Upload new image
export function useUploadImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File): Promise<Image> => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Размер файла превышает 10MB");
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Файл должен быть изображением");
      }

      const formData = new FormData();
      // FastAPI expects parameter name "file" (matches UploadFile = File(...))
      formData.append("file", file);

      let res: Response;
      try {
        // Add timeout for upload (30 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        res = await fetch(`${API_BASE_URL}/api/images`, {
          method: "POST",
          body: formData,
          headers: getApiHeaders(),
          signal: controller.signal,
          // Don't set Content-Type header - browser will set it with boundary for FormData
        });
        
        clearTimeout(timeoutId);
      } catch (networkError: any) {
        if (networkError.name === 'AbortError') {
          throw new Error("Превышено время ожидания. Попробуйте еще раз.");
        }
        throw new Error("Ошибка сети. Проверьте подключение к интернету.");
      }

      if (!res.ok) {
        // Try to parse validation error
        let errorMessage = "Ошибка загрузки изображения";
        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await res.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            // Use default error message
        }
      }
        throw new Error(errorMessage);
      }

      try {
        const data = await res.json();
        return data;
      } catch (jsonError) {
        throw new Error("Ошибка при обработке ответа сервера");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      toast({
        title: "Загрузка успешна",
        description: "Ваше изображение поставлено в очередь на колоризацию.",
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Неизвестная ошибка при загрузке изображения",
        variant: "destructive",
      });
    },
  });
}
