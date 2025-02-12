import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import { fetchFromApi } from "@/lib/fetchFromApi";

export const getFigmaImages = (fileId: string, nodeIds: string[]) => {
  return fetchFromApi(`/figma/images?fileId=${fileId}&nodeIds=${nodeIds.join(",")}`);
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
