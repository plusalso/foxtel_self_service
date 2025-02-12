import { Box } from "@radix-ui/themes";
import { ImageOverlay } from "@/features/figma/components/ImageOverlay";
import { useTemplate } from "@/features/figma/context/TemplateContext";
export function Workspace({ children }: { children?: React.ReactNode }) {
  const { overlayAssets, templateConfig, textInputs } = useTemplate();
  return (
    <Box p="6">
      <ImageOverlay
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
