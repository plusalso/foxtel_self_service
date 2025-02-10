export interface AssetToSync {
  templateName: string;
  groupName: string;
  id: string;
}

export interface FigmaAsset {
  id: string;
  name?: string;
  groupName?: string;
  url?: string;
  order?: number;
}

export interface FigmaTemplateGroup {
  name: string; // e.g., "Wedge1", "logo"
  assets: FigmaAsset[];
}

export interface FigmaTemplate {
  name: string; // e.g., "Single Event Fixture Title"
  groups: FigmaTemplateGroup[];
}

export interface FigmaTemplateResponse {
  templates: FigmaTemplate[];
}
