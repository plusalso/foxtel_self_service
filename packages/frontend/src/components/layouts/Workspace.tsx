import { Box } from "@radix-ui/themes";
import { AssetRenderer } from "@/features/figma/components/AssetRenderer/AssetRenderer";
import { useTemplate } from "@/features/figma/context/TemplateContext";
export function Workspace({ children }: { children?: React.ReactNode }) {
  const { overlayAssets, templateConfig, textInputs } = useTemplate();
  return (
    <Box p="6">
      <AssetRenderer
        selectedAssets={overlayAssets.map((asset) => ({
          fileId: asset.fileId,
          pageName: asset.pageName,
          assetId: asset.assetId,
        }))}
        templateConfig={templateConfig}
        textInputs={textInputs}
      />
      {children}
    </Box>
  );
}
