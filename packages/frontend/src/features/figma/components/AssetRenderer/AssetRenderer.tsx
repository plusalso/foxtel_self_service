import { getS3ImageUrl } from "../../utils/getS3ImageUrl";
import { OverlayAsset, useTemplateState } from "@/features/figma/context/TemplateContext";
import {
  DefaultTextRenderer,
  CornerTextRenderer,
  ResizableImageRenderer,
  TextAreaRenderer,
} from "@/components/CustomFieldRenderers/CustomFieldRenderers";
import { Rnd } from "react-rnd";
import styles from "./AssetRenderer.module.scss";
import { useState, useEffect, useRef } from "react";
import {
  Field,
  ResizableImageDefaults,
  TemplateConfig,
  TemplatePreset,
  TextAreaField,
  TextField,
} from "../../types/template";
import { useResizableImage } from "../../hooks/use-resizeable-image";
import clsx from "clsx";
import { useZoom } from "../../context/ZoomContext";

interface AssetRendererProps {
  selectedAssets: OverlayAsset[];
  templateConfig: TemplateConfig | null;
  currentPreset: TemplatePreset | null;
  textInputs: Record<string, string>;
  customImage: string;
  customImageDefaults?: ResizableImageDefaults;
  enabledFields: Record<string, boolean>;
}
export const renderers = {
  DefaultTextRenderer: DefaultTextRenderer,
  CornerTextRenderer: CornerTextRenderer,
  ResizableImageRenderer: ResizableImageRenderer,
  TextAreaRenderer: TextAreaRenderer,
  // add other renderers here as needed
};
export const AssetRenderer = ({
  customImage,
  customImageDefaults,
  selectedAssets,
  templateConfig,
  currentPreset,
  textInputs,
  enabledFields,
}: AssetRendererProps) => {
  const { scaleFactor } = useZoom();
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedScale, setCalculatedScale] = useState(1);

  // Get dimensions from current preset
  const width = currentPreset?.width ?? 1920;
  const height = currentPreset?.height ?? 1080;
  const {
    position: customImagePosition,
    size: customImageSize,
    getRndSize,
    handleDrag,
    handleResize,
  } = useResizableImage(customImage, customImageDefaults);

  // Filter assets based on whether their corresponding text fields have content
  const filteredAssets = selectedAssets.filter((asset) => {
    // Find the field in template config that corresponds to this asset
    const field = templateConfig?.fields.find((f: any) => f.type === "text" && f.assetSourcePage === asset.pageName);

    // If this isn't a text-based asset, keep it
    if (!field) return true;

    // If it is a text-based asset, only keep it if there's text content
    return Boolean(textInputs[field.id]);
  });

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        if (scaleFactor === "fit") {
          // Calculate scale based on container dimensions and image dimensions
          // This is similar to object-fit: contain in CSS
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight || window.innerHeight * 0.7;

          const widthRatio = containerWidth / width;
          const heightRatio = containerHeight / height;

          // Use the smaller ratio to ensure the entire image fits
          setCalculatedScale(Math.min(widthRatio, heightRatio));
        } else {
          // Use the provided scale directly
          setCalculatedScale(scaleFactor);
        }
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [width, height, scaleFactor]);

  return (
    <div ref={containerRef} className={styles.assetRendererContainer} style={{ maxWidth: `${width}px` }}>
      <div
        className={clsx(styles.handlesContainer)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${calculatedScale})`,
          transformOrigin: "top left",
          pointerEvents: "all",
          zIndex: 2000,
        }}
      >
        {customImage && (
          <Rnd
            className={clsx(styles.handleOnlyContainer, "handleOnlyContainer")}
            style={{
              backgroundColor: "transparent",
              // border: "1px dashed rgba(255,0,0,0.5)", // Temporary debugging border
            }}
            scale={calculatedScale}
            // Don't use default if you're also using position and size props
            position={customImagePosition}
            size={getRndSize()}
            lockAspectRatio={true}
            resizeHandleComponent={{
              topLeft: <div className={styles.resizeHandleTopLeft} />,
              topRight: <div className={styles.resizeHandleTopRight} />,
              bottomLeft: <div className={styles.resizeHandleBottomLeft} />,
              bottomRight: <div className={styles.resizeHandleBottomRight} />,
              top: <div className={styles.resizeHandleTop} />,
              right: <div className={styles.resizeHandleRight} />,
              bottom: <div className={styles.resizeHandleBottom} />,
              left: <div className={styles.resizeHandleLeft} />,
            }}
            onDrag={handleDrag}
            onDragStop={handleDrag}
            onResize={handleResize}
            onResizeStop={handleResize}
          >
            {/* The div inside Rnd needs to have pointerEvents enabled */}
            <div
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: "auto",
                position: "relative",
              }}
            />
          </Rnd>
        )}
      </div>

      <div
        id="image-overlay"
        style={{
          position: "relative",
          width: `${width}px`,
          height: `${height}px`,
          transformOrigin: "top left",
          transform: `scale(${calculatedScale})`,
          backgroundImage:
            "linear-gradient(45deg, #EBEBEB 25%, transparent 25%), linear-gradient(-45deg, #EBEBEB 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EBEBEB 75%), linear-gradient(-45deg, transparent 75%, #EBEBEB 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          overflow: "clip",
        }}
      >
        {customImage && (
          <div
            className={styles.nonDraggableImage}
            style={{
              position: "absolute",
              top: customImagePosition?.y,
              left: customImagePosition?.x,
              width: customImageSize?.width,
              height: customImageSize?.height,
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
          </div>
        )}
        {filteredAssets.map((asset, index) => (
          <div key={asset.assetId} style={{ pointerEvents: "none" }}>
            <OverlayImage
              key={asset.assetId}
              fileId={asset.fileId}
              pageName={asset.pageName}
              assetId={asset.assetId}
              zIndex={asset?.zIndex ? asset.zIndex : filteredAssets.length - index + 1}
            />
          </div>
        ))}

        {/* Render text fields for the current preset with styles */}
        {Object.entries(textInputs).map(([fieldId, value]) => {
          // First check if the field is enabled
          if (enabledFields && enabledFields[fieldId] === false) {
            return null;
          }
          if (!value) {
            return null;
          }
          const field = templateConfig?.fields?.find((field: Field) => {
            if (field.id === fieldId) {
              if (field.type !== "text" && field.type !== "textArea") {
                return false;
              }
              return true;
            }
          }) as TextField | TextAreaField | undefined;

          if (!field) {
            return null;
          }
          const RendererComponent = renderers[field.renderer as keyof typeof renderers];

          if (!RendererComponent) {
            console.warn(`Renderer for ${field.id} - ${field.renderer} not found.`);
            return null;
          }

          return <RendererComponent key={`${currentPreset?.id}-${field.id}-${value}`} field={field} value={value} />;
        })}
      </div>
    </div>
  );
};

interface OverlayImageProps {
  fileId: string;
  pageName: string;
  assetId: string;
  zIndex?: number;
}

const OverlayImage = ({ fileId, pageName, assetId, zIndex }: OverlayImageProps) => {
  const { imageVersion } = useTemplateState();
  const imageUrl = getS3ImageUrl(fileId, pageName, assetId, imageVersion);

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
        zIndex: zIndex ?? 1,
      }}
    />
  );
};
