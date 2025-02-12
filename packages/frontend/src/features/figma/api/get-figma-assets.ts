import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/react-query";
import { fetchFromApi } from "@/lib/fetchFromApi";
export interface FigmaAsset {
  id: string;
  name: string;
  pageName: string;
  pageId?: string;
}

export interface FigmaAssetsResponse {
  [pagePath: string]: FigmaAsset[];
}

export const getFigmaAssets = async (fileId: string, pages: string[]): Promise<FigmaAssetsResponse> => {
  const params = new URLSearchParams({
    fileId,
    pages: pages.join(","),
  });

  return fetchFromApi(`/figma/assets?${params.toString()}`);
};

export const getFigmaAssetsQueryOptions = (fileId: string, pages: string[]) => {
  return queryOptions({
    queryKey: ["figma", "assets", fileId, pages],
    queryFn: () => getFigmaAssets(fileId, pages),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // keep in memory for 1 hour
  });
};

type UseFigmaAssetsOptions = {
  fileId: string;
  pages: string[];
  queryConfig?: QueryConfig<typeof getFigmaAssetsQueryOptions>;
};

export const useFigmaAssets = ({ fileId, pages, queryConfig = {} }: UseFigmaAssetsOptions) => {
  return useQuery({
    ...getFigmaAssetsQueryOptions(fileId, pages),
    enabled: Boolean(fileId && pages.length),
    ...queryConfig,
  });
};
