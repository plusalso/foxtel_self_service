import { FigmaImages } from "@/lib/figma-client";
import { useFigmaFile } from "../api/get-figma-file";
import { getFigmaImages } from "../api/get-figma-images";
import { useQuery } from "@tanstack/react-query";

interface UseFigmaNodesOptions {
  fileId: string;
  nodeIds: string[];
}

export function useFigmaNodes({ fileId, nodeIds }: UseFigmaNodesOptions) {
  const fileQuery = useFigmaFile({ fileId });
  const imagesQuery = useQuery<FigmaImages>({
    queryKey: ["figmaImages", fileId, nodeIds],
    queryFn: () => getFigmaImages(fileId, nodeIds),
  });

  return {
    fileQuery,
    imagesQuery,
    isLoading: fileQuery.isLoading || imagesQuery.isLoading,
    isError: fileQuery.isError || imagesQuery.isError,
    error: fileQuery.error || imagesQuery.error,
  } as const;
}
