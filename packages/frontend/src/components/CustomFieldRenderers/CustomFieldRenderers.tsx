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

// if you can't just use the containerStyle to get what you want, add custom componentsto design more complicated text overlays,
//  Update the json to map to the new component.
// export const CustomTextField = ({ field, value, onChange }) => (
//   <div style={{ ...field.containerStyle, border: '3px dashed red' }}>
//        <icon />
//   </div>
// );
