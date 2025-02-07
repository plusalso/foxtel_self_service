import { queryOptions, useQuery } from "@tanstack/react-query";
import { FigmaImages } from "@/lib/figma-client";
import { QueryConfig } from "@/lib/react-query";

export const getFigmaImages = (fileId: string, nodeIds: string[]): Promise<FigmaImages> => {
  return fetch(`/api/figma/images?fileId=${fileId}&nodeIds=${nodeIds.join(",")}`).then((res) => res.json());
};

export const getFigmaImagesQueryOptions = (fileId: string, nodeIds: string[]) => {
  return queryOptions({
    queryKey: ["figma", "images", fileId, nodeIds],
    queryFn: () => getFigmaImages(fileId, nodeIds),
  });
};

type UseFigmaImagesOptions = {
  fileId: string;
  nodeIds: string[];
  queryConfig?: QueryConfig<typeof getFigmaImagesQueryOptions>;
};

export const useFigmaImages = ({ fileId, nodeIds, queryConfig = {} }: UseFigmaImagesOptions) => {
  return useQuery({
    ...getFigmaImagesQueryOptions(fileId, nodeIds),
    enabled: Boolean(fileId) && nodeIds.length > 0,
    select: (data) => ({ images: data.images }),
    ...queryConfig,
  });
};
