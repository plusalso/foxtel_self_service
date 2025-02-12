import { getS3ImageUrl } from "../hooks/use-figma-image";
import { useTemplate } from "@/features/figma/context/TemplateContext";
import { DefaultTextRenderer, CornerTextRenderer } from "@/components/CustomFieldRenderers/CustomFieldRenderers";
import { Rnd } from "react-rnd";
import styles from "./ImageOverlay.module.scss";
interface ImageOverlayProps {
  selectedAssets: Array<{
    templateName: string;
    groupName: string;
    assetId: string;
  }>;
  templateConfig: any;
  textInputs: Record<string, string>;
}
export const renderers = {
  DefaultTextRenderer: DefaultTextRenderer,
  CornerTextRenderer: CornerTextRenderer,
  // Add other renderers here as needed
};
export const ImageOverlay = ({ selectedAssets, templateConfig, textInputs }: ImageOverlayProps) => {
  const { customImage } = useTemplate();

  return (
    <div
      id="image-overlay"
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",

        backgroundImage:
          "linear-gradient(45deg, #EBEBEB 25%, transparent 25%), linear-gradient(-45deg, #EBEBEB 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EBEBEB 75%), linear-gradient(-45deg, transparent 75%, #EBEBEB 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        overflow: "clip",
      }}
    >
      {customImage && (
        <Rnd
          className={styles.draggableImageContainer}
          default={
            templateConfig?.uploadedImageDefaults ?? {
              x: 0,
              y: 0,
              width: 300,
              height: 600,
            }
          }
          lockAspectRatio={true}
          style={{
            zIndex: 1,
          }}
        >
          <img
            src={customImage}
            alt="Custom"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        </Rnd>
      )}
      {selectedAssets.map((asset, index) => (
        <div style={{ pointerEvents: "none" }}>
          <OverlayImage
            key={asset.assetId}
            templateName={asset.templateName}
            groupName={asset.groupName}
            assetId={asset.assetId}
            zIndex={selectedAssets.length - index + 1}
          />
        </div>
      ))}
      {/* Render text fields with styles */}
      {templateConfig?.fields?.map((field: any) => {
        const RendererComponent = renderers[field.renderer as keyof typeof renderers];

        return <RendererComponent key={field.name} field={field} value={textInputs[field.name] || ""} />;
      })}
    </div>
  );
};

interface OverlayImageProps {
  templateName: string;
  groupName: string;
  assetId: string;
  zIndex: number;
}

const OverlayImage = ({ templateName, groupName, assetId, zIndex }: OverlayImageProps) => {
  const imageUrl = getS3ImageUrl(templateName, groupName, assetId);

  return (
    <img
      src={imageUrl}
      alt={`${templateName}/${groupName}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        zIndex,
      }}
    />
  );
};
