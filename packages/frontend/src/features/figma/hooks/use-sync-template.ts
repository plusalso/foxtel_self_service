import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AssetToSync } from "../types/template";

export const useSyncTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, assets }: { fileId: string; assets: AssetToSync[] }) => {
      const response = await fetch("/api/figma/sync-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, assets }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync assets");
      }

      return response.json();
    },
    onSuccess: (_, { fileId, assets }) => {
      // Group invalidations by template
      const templates = new Set(assets.map((a) => a.templateName));
      templates.forEach((templateName) => {
        queryClient.invalidateQueries({
          queryKey: ["figma-template-assets", fileId, templateName],
        });
      });
    },
  });
};
