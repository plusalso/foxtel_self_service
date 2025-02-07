import { useSyncTemplate } from "../hooks/use-sync-template";
import { FigmaTemplate } from "../types/template";

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
    <div>
      <button onClick={handleSync} disabled={syncTemplate.isPending}>
        {syncTemplate.isPending ? "Syncing..." : "Update Database"}
      </button>
      {syncTemplate.isError && <div className="text-red-500">Failed to sync assets</div>}
    </div>
  );
};
