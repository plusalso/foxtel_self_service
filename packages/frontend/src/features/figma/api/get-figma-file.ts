import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/react-query";

export const getFigmaFile = (fileId: string) => {
  return fetch(`/api/figma/file?fileId=${fileId}`).then((res) => res.json());
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
