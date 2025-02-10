import { useSyncTemplate } from "../hooks/use-sync-template";
import { FigmaTemplate } from "../types/template";
import { Button } from "@radix-ui/themes";

//refresh icon
import { LuRefreshCw } from "react-icons/lu";

interface TemplateHeaderProps {
  fileId: string;
  template?: FigmaTemplate;
}

export const TemplateHeader = ({ fileId, template }: TemplateHeaderProps) => {
  const syncTemplate = useSyncTemplate();

  const handleSync = () => {
    const assets = template?.groups.flatMap((group) =>
      group.assets.map((asset) => ({
        templateName: template?.name,
        groupName: group.name,
        id: asset.id,
      }))
    );

    if (!assets) return;
    syncTemplate.mutate({ fileId, assets });
  };

  return (
    <>
      <Button onClick={handleSync} disabled={syncTemplate.isPending} variant="outline">
        <LuRefreshCw className="w-4 h-4" />
        {syncTemplate.isPending ? "Syncing..." : "Update Database"}
      </Button>
      {syncTemplate.isError && <div className="text-red-500">Failed to sync assets</div>}
    </>
  );
};
