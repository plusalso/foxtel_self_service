import { createContext, useContext, ReactNode, useState } from "react";

interface TemplateContextType {
  overlayAssets: Array<{
    templateName: string;
    groupName: string;
    assetId: string;
  }>;
  fileVersion?: string;
  templateConfig: any;
  textInputs: Record<string, string>;
  customImage: string;
  setOverlayAssets: (
    assets: Array<{
      templateName: string;
      groupName: string;
      assetId: string;
    }>
  ) => void;
  setFileVersion: (version: string) => void;
  setTemplateConfig: (config: any) => void;
  setTextInputs: (inputs: Record<string, string>) => void;
  setCustomImage: (image: string) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [overlayAssets, setOverlayAssets] = useState<
    Array<{
      templateName: string;
      groupName: string;
      assetId: string;
    }>
  >([]);
  const [fileVersion, setFileVersion] = useState<string>();
  const [templateConfig, setTemplateConfig] = useState<any>(null);
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const [customImage, setCustomImage] = useState<string>("");
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
