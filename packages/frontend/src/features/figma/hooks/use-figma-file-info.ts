import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchFromApi } from "@/lib/fetchFromApi";

export interface FigmaFileInfo {
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
}

export const getFigmaFileInfo = async (fileId: string): Promise<FigmaFileInfo> => {
  const response = await fetchFromApi(`/figma/file?fileId=${fileId}`);
  return {
    name: response.name,
    lastModified: response.lastModified,
    thumbnailUrl: response.thumbnailUrl,
  };
};

export const getFigmaFileInfoQueryOptions = (fileId: string) => {
  return queryOptions({
    queryKey: ["figma", "file-info", fileId],
    queryFn: () => getFigmaFileInfo(fileId),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export function useFigmaFileInfo(fileId: string) {
  return useQuery({
    ...getFigmaFileInfoQueryOptions(fileId),
    enabled: Boolean(fileId),
  });
}
