import { useCacheAssets } from "../../hooks/use-sync-template";
import { useRef } from "react";

//refresh icon
import { ImperativeToast, ImperativeToastRef } from "@/components/ImperativeToast/ImperativeToast";
import { useFigmaJobStatus } from "../../hooks/use-figma-job-status";
import { useTemplateState } from "../../context/TemplateContext";
import { UpdateDatabaseModal } from "@/components/UpdateDatabaseModal/UpdateDatabaseModal";
import { useQueryClient } from "@tanstack/react-query";

interface SyncFigmaButtonProps {
  fileId: string;
  pages: string[]; // Changed from nodeIds to pages
}

export const SyncFigmaButton = ({ fileId, pages }: SyncFigmaButtonProps) => {
  const { mutate: cacheAssets, isPending: isCaching } = useCacheAssets(fileId, pages);
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
    cacheAssets(undefined, {
      onSuccess: (data) => {
        const response = data as { jobId: string | null; lastModified: string; version: string };
        if (response.jobId) {
          startPolling(response.jobId);
        } else {
          toastRef.current?.publish(`Complete. No new assets found.`);
        }
      },
      onError: (error) => {
        console.error("Failed to download assets", error);
        toastRef.current?.publish("Asset update failed. Please try again.");
      },
    });
  };

  return (
    <>
      <UpdateDatabaseModal onUpdate={handleSync} onCancel={() => {}} isDisabled={isCaching} isLoading={isCaching} />
      <ImperativeToast ref={toastRef} />
    </>
  );
};
