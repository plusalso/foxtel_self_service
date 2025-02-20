import { createContext, useContext, ReactNode, useState } from "react";
import { TemplateConfig } from "../types/template";

interface OverlayAsset {
  fileId: string;
  pageName: string;
  assetId: string;
}

export type CustomImageDefaults = {
  x: number;
  y: number;
  width?: string | number;
  height?: string | number;
};
interface TemplateContextType {
  overlayAssets: OverlayAsset[];
  fileVersion?: string;
  templateConfig: TemplateConfig;
  textInputs: Record<string, string>;
  customImage: string;
  customImageDefaults?: CustomImageDefaults;
  setOverlayAssets: (assets: OverlayAsset[]) => void;
  setFileVersion: (version: string) => void;
  setTemplateConfig: (config: any) => void;
  setTextInputs: (inputs: Record<string, string>) => void;
  setCustomImage: (image: string) => void;
  setCustomImageDefaults: (defaults: CustomImageDefaults) => void;
  imageVersion: number;
  refreshImages: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [overlayAssets, setOverlayAssets] = useState<OverlayAsset[]>([]);
  const [fileVersion, setFileVersion] = useState<string>();
  const [templateConfig, setTemplateConfig] = useState<any>(null);
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const [customImage, setCustomImage] = useState<string>("");
  const [customImageDefaults, setCustomImageDefaults] = useState<CustomImageDefaults | undefined>(undefined);
  const [imageVersion, setImageVersion] = useState<number>(Date.now());
  const refreshImages = () => {
    setImageVersion(Date.now());
  };
  return (
    <TemplateContext.Provider
      value={{
        overlayAssets,
        setOverlayAssets,
        fileVersion,
        setFileVersion,
        templateConfig,
        setTemplateConfig,
        textInputs,
        setTextInputs,
        customImage,
        setCustomImage,
        customImageDefaults,
        setCustomImageDefaults,
        imageVersion,
        refreshImages,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplateState() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
}
