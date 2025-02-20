import { createContext, useContext, ReactNode, useState } from "react";
import { TemplateConfig } from "../types/template";

interface OverlayAsset {
  fileId: string;
  pageName: string;
  assetId: string;
}

interface TemplateContextType {
  overlayAssets: OverlayAsset[];
  fileVersion?: string;
  templateConfig: TemplateConfig;
  textInputs: Record<string, string>;
  customImage: string;
  setOverlayAssets: (assets: OverlayAsset[]) => void;
  setFileVersion: (version: string) => void;
  setTemplateConfig: (config: any) => void;
  setTextInputs: (inputs: Record<string, string>) => void;
  setCustomImage: (image: string) => void;
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
        imageVersion,
        refreshImages,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
}
