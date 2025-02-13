import { useCacheAssets } from "../hooks/use-sync-template";
import { Button } from "@radix-ui/themes";

//refresh icon
import { LuRefreshCw } from "react-icons/lu";

interface TemplateHeaderProps {
  fileId: string;
  nodeIds: string[];
}

export const TemplateHeader = ({ fileId, nodeIds }: TemplateHeaderProps) => {
  const cacheAssets = useCacheAssets();

  const handleSync = () => {
    console.log("nodeIds", nodeIds);
    if (!nodeIds || nodeIds.length === 0) return;
    cacheAssets.mutate({ fileId, nodeIds });
  };

  return (
    <>
      <Button onClick={handleSync} disabled={cacheAssets.isPending} variant="outline">
        <LuRefreshCw className="w-4 h-4" />
        {cacheAssets.isPending ? "Syncing..." : "Update Database"}
      </Button>
      {cacheAssets.isError && <div className="text-red-500">Failed to sync assets</div>}
    </>
  );
};
