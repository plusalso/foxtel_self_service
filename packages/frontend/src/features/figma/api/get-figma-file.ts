import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/react-query";
import { fetchFromApi } from "@/lib/fetchFromApi";
export const getFigmaFile = (fileId: string) => {
  return fetchFromApi(`/figma/file?fileId=${fileId}`);
};

export const getFigmaFileQueryOptions = (fileId: string) => {
  return queryOptions({
    queryKey: ["figma", "file", fileId],
    queryFn: () => getFigmaFile(fileId),
  });
};

type UseFigmaFileOptions = {
  fileId: string;
  queryConfig?: QueryConfig<typeof getFigmaFileQueryOptions>;
};

export const useFigmaFile = ({ fileId, queryConfig = {} }: UseFigmaFileOptions) => {
  return useQuery({
    ...getFigmaFileQueryOptions(fileId),
    enabled: Boolean(fileId),
    ...queryConfig,
  });
};
