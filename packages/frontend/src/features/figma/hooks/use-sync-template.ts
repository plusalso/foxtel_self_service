import { useMutation } from "@tanstack/react-query";

export const useCacheAssets = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, nodeIds }: { fileId: string; nodeIds: string[] }) => {
      const response = await fetch("/figma/cache-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, nodeIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync assets");
      }

      return response.json();
    },
    // onSuccess: (_, { fileId, nodeIds }) => {
    //   // Group invalidations by template
    //   const templates = new Set(nodeIds);
    //   templates.forEach((templateName) => {
    //     queryClient.invalidateQueries({
    //       queryKey: ["figma-template-assets", fileId, templateName],
    //     });
    //   });
    // },
  });
};
