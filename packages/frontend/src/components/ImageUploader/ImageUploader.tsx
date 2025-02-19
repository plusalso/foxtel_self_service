// ImageUpload.tsx
import { useRef, useState } from "react";
import { useTemplate } from "@/features/figma/context/TemplateContext";
import { Button, Text, Flex } from "@radix-ui/themes";
import { DeleteImageModalTrigger } from "../DeleteImageModalTrigger/DeleteImageModalTrigger";
import styles from "./ImageUploader.module.scss";
interface ImageUploaderProps {
  label: string;
}

const ImageUpload = ({ label }: ImageUploaderProps) => {
  const { setCustomImage, customImage, templateConfig } = useTemplate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");

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
      <Text size="2">{label}</Text>
      {fileName && customImage ? (
        <Flex justify="between" align="center" className={styles.uploadedImageDisplay}>
          <Text size="1">{fileName}</Text>
          <DeleteImageModalTrigger onDelete={handleRemoveImage} onCancel={() => {}} />
        </Flex>
      ) : (
        <>
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
        </>
      )}
    </Flex>
  );
};

export default ImageUpload;
