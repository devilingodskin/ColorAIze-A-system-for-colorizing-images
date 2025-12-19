import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Image } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch all images
export function useImages() {
  return useQuery({
    queryKey: [api.images.list.path],
    queryFn: async () => {
      const res = await fetch(api.images.list.path);
      if (!res.ok) throw new Error("Failed to fetch images");
      return api.images.list.responses[200].parse(await res.json());
    },
    // Refresh occasionally to check for updates
    refetchInterval: 5000, 
  });
}

// Fetch single image with smart polling
export function useImage(id: number) {
  return useQuery({
    queryKey: [api.images.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.images.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch image");
      return api.images.get.responses[200].parse(await res.json());
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
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(api.images.upload.path, {
        method: api.images.upload.method,
        body: formData,
      });

      if (!res.ok) {
        // Try to parse validation error
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || "Upload failed");
        } catch (e) {
          throw new Error("Failed to upload image");
        }
      }

      return api.images.upload.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.images.list.path] });
      toast({
        title: "Upload Successful",
        description: "Your image is now queued for colorization.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
