import { Rnd } from "react-rnd";
//after adding new renderers, add them to the renderers object in ImageOverlay.tsx
export const DefaultTextRenderer = ({
  field, //the json template config
  value, //the value of the text field
}: {
  field: any;
  value: string;
}) => (
  <div style={field.containerStyle}>
    <span>{value}</span>
  </div>
);

export const CornerTextRenderer = ({ field, value }: { field: any; value: string }) => {
  if (!value) {
    return null;
  }
  return (
    <div style={field.containerStyle}>
      {/* counter-skew the text */}
      <span style={{ transform: "skewX(21.68deg)", display: "block" }}>{value}</span>
    </div>
  );
};

export const TextAreaRenderer = ({ field, value }: { field: any; value: string }) => (
  <div style={field.containerStyle}>
    <span style={{ whiteSpace: "pre-line" }}>{value}</span>
  </div>
);

export const ResizableImageRenderer = ({ field, value }: { field: any; value: string }) => (
  <Rnd
    default={{
      x: field.containerStyle?.x || 0,
      y: field.containerStyle?.y || 0,
      width: field.containerStyle?.width || 100,
      height: field.containerStyle?.height || 100,
    }}
    lockAspectRatio={true}
    style={{
      zIndex: field.containerStyle?.zIndex || 1,
    }}
  >
    <img
      src={value}
      alt={field.label}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        pointerEvents: "none",
      }}
    />
  </Rnd>
);
