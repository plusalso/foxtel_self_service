export interface FigmaAsset {
  id: string;
  name: string;
  pageId?: string;
  imageUrl?: string;
  order?: number;
}

export interface FigmaTemplateGroup {
  name: string; // e.g., "Wedge1", "logo"
  id: string;
  assets: FigmaAsset[];
  defaultValue?: string;
}

export interface FigmaTemplate {
  name: string; // e.g., "Single Event Fixture Title"
  groups: FigmaTemplateGroup[];
}

export interface FigmaTemplateResponse {
  templates: FigmaTemplate[];
}

export interface AssetToSync {
  templateName: string;
  groupName: string;
  id: string;
}

/**
 * String literal union for text field renderer types. Add more if needed.
 */
export type TextRenderer = "DefaultTextRenderer" | "CornerTextRenderer";

interface BaseField {
  id: string;
  label: string;
  containerStyle?: React.CSSProperties;
  assetSourcePage?: string;
}

export interface TextField extends BaseField {
  type: "text";
  defaultAssetName?: string;
  renderer?: TextRenderer;
}

export interface TextAreaField extends BaseField {
  type: "textArea";
  defaultAssetName?: string;
  renderer?: TextRenderer;
}

export interface FigmaAssetDropdownSelectField extends BaseField {
  type: "figmaAssetDropdownSelect";
}

export interface StaticAssetField extends BaseField {
  type: "staticAsset";
  assetSourcePage: string; // Required for static assets
  assetName: string; // Required for static assets
  zIndex?: number; // Optional override for zIndex
}

export type Field = TextField | TextAreaField | FigmaAssetDropdownSelectField | StaticAssetField;

export interface PresetField {
  fieldId: string;
  defaultValue: string;
  defaultEnabled?: boolean;
}

export interface TemplatePreset {
  id: string;
  label: string;
  supportsUploadedImages?: boolean;
  uploadedImageDefaults?: ResizableImageDefaults;
  uploadedImageLabel?: string;
  width?: number;
  height?: number;
  fields: PresetField[];
}
export interface ResizableImageDefaults {
  x: number;
  y: number;
  width: string;
  height: string;
}

export interface TemplateConfig {
  id: string;
  fileId: string;
  filename?: string;
  presets: TemplatePreset[];
  fields: Field[];
}
