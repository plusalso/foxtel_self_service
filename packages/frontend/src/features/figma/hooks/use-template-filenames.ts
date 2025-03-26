import { useQueries } from "@tanstack/react-query";
import { getFigmaFileInfo } from "./use-figma-file-info";
import { TemplateConfig } from "../types/template";

/**
 * Hook to fetch Figma filenames for a collection of templates
 * @param templateConfigs Object mapping template keys to their configs
 * @returns Object mapping template keys to their actual Figma filenames
 */
export function useTemplateFilenames(templateConfigs: Record<string, TemplateConfig>) {
  // Fetch file info for all templates at once
  const fileInfoQueries = useQueries({
    queries: Object.entries(templateConfigs).map(([_, config]) => ({
      queryKey: ["figma", "file-info", config.fileId],
      queryFn: () => getFigmaFileInfo(config.fileId),
      staleTime: 1000 * 60 * 60, // 1 hour
    })),
  });

  // Create a mapping of template keys to file names
  return Object.keys(templateConfigs).reduce((acc, key, index) => {
    const query = fileInfoQueries[index];
    acc[key] = query.data?.name || key;
    return acc;
  }, {} as Record<string, string>);
}
