import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchFromApi } from "@/lib/fetchFromApi";

export interface FigmaJobStatusResponse {
  jobId: string;
  status: "pending" | "completed" | "failed";
  message?: string;
}

export type UseFigmaJobStatusOptions = {
  pollInterval?: number;
  onComplete?: (data: FigmaJobStatusResponse) => void;
  onError?: (data: FigmaJobStatusResponse) => void;
};

export function useFigmaJobStatus(options?: UseFigmaJobStatusOptions) {
  const { pollInterval = 5000, onComplete, onError } = options || {};
  const [jobId, setJobId] = useState<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(false);
  // Track completed jobs to prevent multiple onComplete calls
  const completedJobsRef = useRef<Set<string>>(new Set());

  const query = useQuery<FigmaJobStatusResponse>({
    queryKey: ["figma", "job-status", jobId],
    queryFn: async () => {
      return await fetchFromApi(`/figma/job-status?jobId=${jobId}`);
    },
    enabled: shouldPoll && Boolean(jobId),
    refetchInterval: (data) => {
      return data && (data?.state?.data?.status === "completed" || data?.state?.data?.status === "failed")
        ? false
        : pollInterval;
    },
  });

  useEffect(() => {
    if (!query.data || !jobId) return;

    if (query.data.status === "completed" && !completedJobsRef.current.has(jobId)) {
      completedJobsRef.current.add(jobId);
      onComplete?.(query.data);
    } else if (query.data.status === "failed" && !completedJobsRef.current.has(jobId)) {
      completedJobsRef.current.add(jobId);
      onError?.(query.data);
    }
  }, [query.data, jobId, onComplete, onError]);

  const startPolling = useCallback((newJobId: string) => {
    console.log("startPolling", newJobId);
    setJobId(newJobId);
    setShouldPoll(true);
  }, []);

  const stopPolling = useCallback(() => {
    setShouldPoll(false);
  }, []);

  // Clear completed status when stopping or starting new poll
  const clearCompletedStatus = useCallback((jobIdToClear?: string) => {
    if (jobIdToClear) {
      completedJobsRef.current.delete(jobIdToClear);
    } else {
      completedJobsRef.current.clear();
    }
  }, []);

  return {
    ...query,
    startPolling,
    stopPolling,
    clearCompletedStatus,
  };
}
