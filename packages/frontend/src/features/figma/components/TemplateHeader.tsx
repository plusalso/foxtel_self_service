import { useCacheAssets } from "../hooks/use-sync-template";
import { Button } from "@radix-ui/themes";
import { useRef } from "react";

//refresh icon
import { LuRefreshCw } from "react-icons/lu";
import { ImperativeToast, ImperativeToastRef } from "@/components/ImperativeToast/ImperativeToast";
import { useFigmaJobStatus } from "../hooks/use-figma-job-status";

interface TemplateHeaderProps {
  fileId: string;
  nodeIds: string[];
}

export const TemplateHeader = ({ fileId, nodeIds }: TemplateHeaderProps) => {
  const { mutate: cacheAssets, isPending: isCaching } = useCacheAssets();
  const toastRef = useRef<ImperativeToastRef>(null);
  const { startPolling, stopPolling } = useFigmaJobStatus({
    pollInterval: 5000,
    onComplete: () => {
      console.log("onComplete!");
      toastRef.current?.publish("Asset upload completed successfully.");
      stopPolling();
    },
    onError: () => {
      toastRef.current?.publish("Asset upload failed. Please try again.");
      stopPolling();
    },
  });

  const handleSync = () => {
    console.log("nodeIds", nodeIds);
    toastRef.current?.publish("Syncing assets...");
    if (!nodeIds || nodeIds.length === 0) return;
    cacheAssets(
      { fileId, nodeIds },
      {
        onSuccess: (data) => {
          console.log("onSuccess!", data);
          // Expecting API to return an object with a "jobId". If no new assets were found, jobId can be null.
          const response = data as { jobId: string | null };
          if (response.jobId) {
            startPolling(response.jobId);
          } else {
            toastRef.current?.publish("Asset update complete. No new assets found.");
          }
        },
        onError: (error) => {
          console.error("Failed to download assets", error);
          toastRef.current?.publish("Asset update failed. Please try again.");
        },
      }
    );
  };

  console.log("rerender template header");
  return (
    <>
      <Button onClick={handleSync} disabled={isCaching} variant="outline">
        <LuRefreshCw className="w-4 h-4" />
        {isCaching ? "Syncing..." : "Update Database from File"}
      </Button>

      <ImperativeToast ref={toastRef} />
    </>
  );
};
