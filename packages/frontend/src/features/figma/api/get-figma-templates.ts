import { queryOptions, useQuery } from "@tanstack/react-query";
import { FigmaTemplateResponse } from "../types/template";
import { QueryConfig } from "@/lib/react-query";
import { fetchFromApi } from "@/lib/fetchFromApi";
export const getFigmaTemplates = (fileId: string, templateNames?: string[]): Promise<FigmaTemplateResponse> => {
  const params = new URLSearchParams({ fileId });
  if (templateNames?.length) {
    params.append("templateNames", templateNames.join(","));
  }

  return fetchFromApi(`/api/figma/templates?${params.toString()}`);
};

export const getFigmaTemplatesQueryOptions = (fileId: string, templateNames?: string[]) => {
  return queryOptions({
    queryKey: ["figma", "templates", fileId, templateNames],
    queryFn: () => getFigmaTemplates(fileId, templateNames),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // keep in memory for 1 hour
  });
};

type UseFigmaTemplatesOptions = {
  fileId: string;
  templateNames?: string[];
  queryConfig?: QueryConfig<typeof getFigmaTemplatesQueryOptions>;
};

export const useFigmaTemplates = ({ fileId, templateNames, queryConfig = {} }: UseFigmaTemplatesOptions) => {
  return useQuery({
    ...getFigmaTemplatesQueryOptions(fileId, templateNames),
    enabled: Boolean(fileId),
    ...queryConfig,
  });
};
