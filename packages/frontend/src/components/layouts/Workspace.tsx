import { Box } from "@radix-ui/themes";
import { AssetRenderer } from "@/features/figma/components/AssetRenderer/AssetRenderer";
import { useTemplateState } from "@/features/figma/context/TemplateContext";
import styles from "./Workspace.module.scss";
export function Workspace({ children }: { children?: React.ReactNode }) {
  const { overlayAssets, templateConfig, textInputs, customImage, customImageDefaults } = useTemplateState();
  // console.log("overlayAssets", overlayAssets);
  return (
    <Box p="6" className={styles.workspace}>
      <AssetRenderer
        customImage={customImage}
        selectedAssets={overlayAssets.map((asset) => ({
          fileId: asset.fileId,
          pageName: asset.pageName,
          assetId: asset.assetId,
        }))}
        templateConfig={templateConfig}
        textInputs={textInputs}
        customImageDefaults={customImageDefaults}
      />
      {children}
    </Box>
  );
}
