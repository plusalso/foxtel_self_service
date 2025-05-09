import { Box } from "@radix-ui/themes";
import { AssetRenderer } from "@/features/figma/components/AssetRenderer/AssetRenderer";
import { useTemplateState } from "@/features/figma/context/TemplateContext";
import styles from "./Workspace.module.scss";
import clsx from "clsx";

export function Workspace({ children }: { children?: React.ReactNode }) {
  const { overlayAssets, templateConfig, textInputs, customImage, customImageDefaults, currentPreset, enabledFields } =
    useTemplateState();

  return (
    <Box p="6" className={clsx(styles.workspace, "workspace")} style={{ position: "relative" }}>
      <AssetRenderer
        customImage={customImage}
        selectedAssets={overlayAssets}
        templateConfig={templateConfig}
        textInputs={textInputs}
        currentPreset={currentPreset}
        customImageDefaults={customImageDefaults}
        enabledFields={enabledFields}
      />
      {children}
    </Box>
  );
}
