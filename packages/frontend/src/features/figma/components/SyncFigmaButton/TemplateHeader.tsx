import { useCacheAssets } from "../../hooks/use-sync-template";
import { Button } from "@radix-ui/themes";
import { useRef } from "react";

//refresh icon
import { LuRefreshCw } from "react-icons/lu";
import { ImperativeToast, ImperativeToastRef } from "@/components/ImperativeToast/ImperativeToast";
import { useFigmaJobStatus } from "../../hooks/use-figma-job-status";
import { useTemplate } from "../../context/TemplateContext";

interface SyncFigmaButton {
  fileId: string;
  nodeIds: string[];
}

export const SyncFigmaButton = ({ fileId, nodeIds }: SyncFigmaButton) => {
  const { mutate: cacheAssets, isPending: isCaching } = useCacheAssets();
  const toastRef = useRef<ImperativeToastRef>(null);
  const { refreshImages } = useTemplate();
  const { startPolling, stopPolling } = useFigmaJobStatus({
    pollInterval: 5000,
    onComplete: () => {
      console.log("onComplete!");
      refreshImages();
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
    toastRef.current?.publish(`Syncing assets...`);
    if (!nodeIds || nodeIds.length === 0) return;
    cacheAssets(
      { fileId, nodeIds },
      {
        onSuccess: (data) => {
          console.log("onSuccess!", data);
          // Expecting API to return an object with a "jobId". If no new assets were found, jobId can be null.
          const response = data as { jobId: string | null; lastModified: string; version: string };
          //convert iso lastModified into "minutes/hours/days ago"
          const lastModified = new Date(response.lastModified);
          const diffTime = Math.abs(Date.now() - lastModified.getTime());

          let diffTimeString = "";

          if (diffTime >= 1000 * 60 * 60 * 24) {
            // More than a day
            diffTimeString = `${Math.floor(diffTime / (1000 * 60 * 60 * 24))}d`;
          } else if (diffTime >= 1000 * 60 * 60) {
            // More than an hour
            diffTimeString = `${Math.floor(diffTime / (1000 * 60 * 60))}h`;
          } else {
            // Less than an hour
            diffTimeString = `${Math.floor(diffTime / (1000 * 60))}m`;
          }

          const lastModifiedString = `Last modified: ${diffTimeString} ago`;
          if (response.jobId) {
            toastRef.current?.publish(`Found new assets. ${lastModifiedString}. Syncing...`);
            startPolling(response.jobId);
          } else {
            toastRef.current?.publish(`Complete. No new assets found. ${lastModifiedString}.`);
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
