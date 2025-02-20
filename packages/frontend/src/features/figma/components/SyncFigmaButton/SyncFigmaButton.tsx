import { useCacheAssets } from "../../hooks/use-sync-template";
import { useRef } from "react";

//refresh icon
import { ImperativeToast, ImperativeToastRef } from "@/components/ImperativeToast/ImperativeToast";
import { useFigmaJobStatus } from "../../hooks/use-figma-job-status";
import { useTemplateState } from "../../context/TemplateContext";
import { UpdateDatabaseModal } from "@/components/UpdateDatabaseModal/UpdateDatabaseModal";
import { useQueryClient } from "@tanstack/react-query";
interface SyncFigmaButton {
  fileId: string;
  nodeIds: string[];
}

export const SyncFigmaButton = ({ fileId, nodeIds }: SyncFigmaButton) => {
  const { mutate: cacheAssets, isPending: isCaching } = useCacheAssets();
  const queryClient = useQueryClient();

  const toastRef = useRef<ImperativeToastRef>(null);
  const { refreshImages } = useTemplateState();
  const { startPolling, stopPolling } = useFigmaJobStatus({
    pollInterval: 5000,
    onComplete: () => {
      console.log("onComplete!");
      refreshImages();
      queryClient.invalidateQueries({ queryKey: ["figma", "assets", fileId] });

      toastRef.current?.publish("Asset upload completed successfully.");
      stopPolling();
    },
    onError: () => {
      toastRef.current?.publish("Asset upload failed. Please try again.");
      stopPolling();
    },
  });

  const handleSync = () => {
    // toastRef.current?.publish(`Syncing assets...`);
    if (!nodeIds || nodeIds.length === 0) return;
    cacheAssets(
      { fileId, nodeIds },
      {
        onSuccess: (data) => {
          console.log("onSuccess!", data);
          // Expecting API to return an object with a "jobId". If no new assets were found, jobId can be null.
          const response = data as { jobId: string | null; lastModified: string; version: string };
          //convert iso lastModified into "minutes/hours/days ago"
          // const lastModified = new Date(response.lastModified);
          // const diffTime = Math.abs(Date.now() - lastModified.getTime());

          // let diffTimeString = "";

          // if (diffTime >= 1000 * 60 * 60 * 24) {
          //   // More than a day
          //   diffTimeString = `${Math.floor(diffTime / (1000 * 60 * 60 * 24))}d`;
          // } else if (diffTime >= 1000 * 60 * 60) {
          //   // More than an hour
          //   diffTimeString = `${Math.floor(diffTime / (1000 * 60 * 60))}h`;
          // } else {
          //   // Less than an hour
          //   diffTimeString = `${Math.floor(diffTime / (1000 * 60))}m`;
          // }

          // const lastModifiedString = `Last modified: ${diffTimeString} ago`;
          if (response.jobId) {
            // toastRef.current?.publish(`Found new assets. ${lastModifiedString}. Syncing...`);
            startPolling(response.jobId);
          } else {
            toastRef.current?.publish(`Complete. No new assets found.`);
          }
        },
        onError: (error) => {
          console.error("Failed to download assets", error);
          toastRef.current?.publish("Asset update failed. Please try again.");
        },
      }
    );
  };

  return (
    <>
      <UpdateDatabaseModal onUpdate={handleSync} onCancel={() => {}} isDisabled={isCaching} isLoading={isCaching} />

      <ImperativeToast ref={toastRef} />
    </>
  );
};
