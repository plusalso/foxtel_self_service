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

// Reusable function to add soft hyphens to text
export const addSoftHyphens = (text: string, interval = 5) => {
  if (!text) return "";

  return text
    .split(" ")
    .map((word) => {
      // Only add hyphens to longer words
      if (word.length > interval + 2) {
        let result = "";
        for (let i = 0; i < word.length; i++) {
          result += word[i];
          // Add soft hyphen after every few characters, but not at the beginning or end
          if (i > 0 && i < word.length - 2 && (i + 1) % interval === 0) {
            result += "\u00AD"; // Unicode soft hyphen
          }
        }
        return result;
      }
      return word;
    })
    .join(" ");
};

export const TextAreaRenderer = ({ field, value }: { field: any; value: string }) => {
  // Apply soft hyphens to the text
  const processedValue = addSoftHyphens(value);

  return (
    <div style={field.containerStyle}>
      <div
        style={{
          // Basic styling
          width: "100%",
          maxWidth: "100%",

          // Word breaking properties
          overflowWrap: "break-word",
          wordWrap: "break-word", // For older browsers

          // Hyphenation properties (still useful as fallback)
          hyphens: "auto",
          WebkitHyphens: "auto",
          msHyphens: "auto",

          // Don't override any text-transform that might be in containerStyle
          ...field.textStyle,
        }}
        lang="en"
      >
        {processedValue}
      </div>
    </div>
  );
};

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
