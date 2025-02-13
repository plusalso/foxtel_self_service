import { getS3ImageUrl } from "../hooks/use-figma-image";
import { useTemplate } from "@/features/figma/context/TemplateContext";
import {
  DefaultTextRenderer,
  CornerTextRenderer,
  ResizableImageRenderer,
} from "@/components/CustomFieldRenderers/CustomFieldRenderers";
import { Rnd } from "react-rnd";
import styles from "./ImageOverlay.module.scss";
import { useState, useEffect, useRef } from 'react';

interface ImageOverlayProps {
  selectedAssets: Array<{
    fileId: string;
    pageName: string;
    assetId: string;
  }>;
  templateConfig: any;
  textInputs: Record<string, string>;
}
export const renderers = {
  DefaultTextRenderer: DefaultTextRenderer,
  CornerTextRenderer: CornerTextRenderer,
  ResizableImageRenderer: ResizableImageRenderer,
  // add other renderers here as needed
};
export const ImageOverlay = ({ selectedAssets, templateConfig, textInputs }: ImageOverlayProps) => {
  const { customImage } = useTemplate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setScale(Math.min(1, containerWidth / 1920));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: "100%", maxWidth: "1920px", margin: "0 auto" }}
    >
      <div
        id="image-overlay"
        style={{
          position: "relative",
          width: "1920px",
          height: "1080px",
          transformOrigin: "top left",
          transform: `scale(${scale})`,
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
          <div key={asset.assetId} style={{ pointerEvents: "none" }}>
            <OverlayImage
              key={asset.assetId}
              fileId={asset.fileId}
              pageName={asset.pageName}
              assetId={asset.assetId}
              zIndex={selectedAssets.length - index + 1}
            />
          </div>
        ))}
        {/* Render text fields with styles */}
        {Object.entries(textInputs).map(([fieldId, value]) => {
          //find the field in the template config
          const field = templateConfig?.fields?.find((field: any) => field.id === fieldId);
          const RendererComponent = renderers[field.renderer as keyof typeof renderers];

          if (!RendererComponent) {
            console.warn(`Renderer for ${field.id} - ${field.renderer} not found.`);
            return null;
          }

          return <RendererComponent key={field.name} field={field} value={value} />;
        })}
      </div>
    </div>
  );
};

interface OverlayImageProps {
  fileId: string;
  pageName: string;
  assetId: string;
  zIndex: number;
}

const OverlayImage = ({ fileId, pageName, assetId, zIndex }: OverlayImageProps) => {
  const imageUrl = getS3ImageUrl(fileId, pageName, assetId);

  return (
    <img
      src={imageUrl}
      alt={pageName}
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
