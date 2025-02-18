import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { fetchFromApi } from "@/lib/fetchFromApi";

export interface FigmaJobStatusResponse {
  jobId: string;
  status: "pending" | "completed" | "failed";
  message?: string;
  // additional fields like fileId, assetsCount, etc.
}

export type UseFigmaJobStatusOptions = {
  pollInterval?: number;
  onComplete?: (data: FigmaJobStatusResponse) => void;
  onError?: (data: FigmaJobStatusResponse) => void;
};

export function useFigmaJobStatus(options?: UseFigmaJobStatusOptions) {
  const { pollInterval = 5000, onComplete, onError } = options || {};
  // Internal state to control when to poll and hold the jobId.
  const [jobId, setJobId] = useState<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(false);

  const query = useQuery<FigmaJobStatusResponse>({
    queryKey: ["figma", "job-status", jobId],
    queryFn: async () => {
      return await fetchFromApi(`/figma/job-status?jobId=${jobId}`);
    },
    // Polling enabled only when we have a jobId and have been told to poll:
    enabled: shouldPoll && Boolean(jobId),
    // Stop polling once the job is complete or failed.
    refetchInterval: (data) => {
      return data && (data?.state?.data?.status === "completed" || data?.state?.data?.status === "failed")
        ? false
        : pollInterval;
    },
  });

  useEffect(() => {
    if (query.data) {
      if (query.data.status === "completed") {
        onComplete && onComplete(query.data);
      } else if (query.data.status === "failed") {
        onError && onError(query.data);
      }
    }
  }, [query.data, onComplete, onError]);

  // When this function is called with a jobId, we start polling.
  const startPolling = useCallback((newJobId: string) => {
    console.log("startPolling", newJobId);
    setJobId(newJobId);
    setShouldPoll(true);
  }, []);

  // Optionally, you can also stop polling when needed.
  const stopPolling = useCallback(() => {
    setShouldPoll(false);
  }, []);

  return { ...query, startPolling, stopPolling };
}
