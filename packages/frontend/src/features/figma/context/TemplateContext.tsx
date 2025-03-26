import { createContext, useContext, ReactNode, useState } from "react";
import { ResizableImageDefaults, TemplateConfig, TemplatePreset } from "../types/template";

export interface OverlayAsset {
  fileId: string;
  pageName: string;
  assetId: string;
  zIndex?: number;
}

interface TemplateContextType {
  overlayAssets: OverlayAsset[];
  fileVersion?: string;
  templateConfig: TemplateConfig | null;
  currentPreset: TemplatePreset | null;
  textInputs: Record<string, string>;
  persistentFieldValues: Record<string, string>;
  customImage: string;
  customImageDefaults?: ResizableImageDefaults;
  setOverlayAssets: (assets: OverlayAsset[]) => void;
  setFileVersion: (version: string) => void;
  setTemplateConfig: (config: TemplateConfig) => void;
  setCurrentPreset: (preset: TemplatePreset) => void;
  setTextInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setPersistentFieldValue: (fieldId: string, value: string) => void;
  setCustomImage: (image: string) => void;
  setCustomImageDefaults: (defaults: ResizableImageDefaults) => void;
  imageVersion: number;
  refreshImages: () => void;
  enabledFields: Record<string, boolean>;
  toggleFieldEnabled: (fieldId: string, enabled: boolean) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [overlayAssets, setOverlayAssets] = useState<OverlayAsset[]>([]);
  const [fileVersion, setFileVersion] = useState<string>();
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
  const [currentPreset, setCurrentPreset] = useState<TemplatePreset | null>(null);
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const [persistentFieldValues, setPersistentFieldValues] = useState<Record<string, string>>({});
  const [customImage, setCustomImage] = useState<string>("");
  const [customImageDefaults, setCustomImageDefaults] = useState<ResizableImageDefaults | undefined>(undefined);
  const [imageVersion, setImageVersion] = useState<number>(Date.now());
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});

  const refreshImages = () => {
    setImageVersion(Date.now());
  };

  const setPersistentFieldValue = (fieldId: string, value: string) => {
    console.log(`Setting persistent value for ${fieldId}: "${value}"`);
    setPersistentFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const toggleFieldEnabled = (fieldId: string, enabled: boolean) => {
    setEnabledFields((prev) => ({
      ...prev,
      [fieldId]: enabled,
    }));
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
        currentPreset,
        setCurrentPreset,
        textInputs,
        setTextInputs,
        persistentFieldValues,
        setPersistentFieldValue,
        customImage,
        setCustomImage,
        customImageDefaults,
        setCustomImageDefaults,
        imageVersion,
        refreshImages,
        enabledFields,
        toggleFieldEnabled,
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
