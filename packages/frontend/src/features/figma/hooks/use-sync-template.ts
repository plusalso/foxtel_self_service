import { useMutation } from "@tanstack/react-query";
import { fetchFromApi } from "@/lib/fetchFromApi";

export const useCacheAssets = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, nodeIds }: { fileId: string; nodeIds: string[] }) => {
      return fetchFromApi("/figma/cache-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, nodeIds }),
      });
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
