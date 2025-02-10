// ImageUpload.tsx
import { useRef, useState } from "react";
import { useTemplate } from "@/features/figma/context/TemplateContext";
import { Button, Text, Flex } from "@radix-ui/themes";

const ImageUpload = () => {
  const { setCustomImage, customImage, templateConfig } = useTemplate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");

  if (!templateConfig?.supportsUploadedImages) {
    return null; // Do not render if uploaded images are not supported
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name); // Set the filename
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCustomImage("");
    setFileName(""); // Clear the filename
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the input value
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Flex direction="column" gap="2">
      <Button variant="surface" onClick={triggerFileInput}>
        Upload Image
      </Button>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
        style={{ display: "none" }} // Hide the default file input
      />
      {fileName && <Text size="1">{fileName}</Text>} {/* Display the filename */}
      {customImage && (
        <Button variant="ghost" onClick={handleRemoveImage}>
          Remove Image
        </Button>
      )}
    </Flex>
  );
};

export default ImageUpload;
