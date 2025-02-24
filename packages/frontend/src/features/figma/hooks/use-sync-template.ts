import { useMutation } from "@tanstack/react-query";
import { fetchFromApi } from "@/lib/fetchFromApi";
import { useFigmaAssets } from "./use-figma-assets";

export const useCacheAssets = (fileId: string, pages: string[]) => {
  const { data: assetsData } = useFigmaAssets({ fileId, pages });

  // Get the page node IDs from the assets data
  const getPageNodeIds = () => {
    if (!assetsData) return [];
    const uniquePageIds = new Set<string>();

    Object.values(assetsData?.assets || {}).forEach((pageAssets) => {
      if (pageAssets.length > 0) {
        const firstAsset = pageAssets[0];
        if (firstAsset.pageId) {
          uniquePageIds.add(firstAsset.pageId);
        }
      }
    });

    return Array.from(uniquePageIds);
  };

  return useMutation({
    mutationFn: async () => {
      // Get fresh node IDs before making the request
      const nodeIds = getPageNodeIds();

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
