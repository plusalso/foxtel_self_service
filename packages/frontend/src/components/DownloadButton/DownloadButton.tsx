import { useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import { Button, Flex, Select, Text, TextField } from "@radix-ui/themes";
import { Options } from "html-to-image/lib/types";
import { LuDownload, LuLoader } from "react-icons/lu";
import styles from "./DownloadButton.module.scss";
import { useTemplateState } from "@/features/figma/context/TemplateContext";

const DownloadButton = () => {
  const [filename, setFilename] = useState("composited-image");
  const [format, setFormat] = useState("png");
  const [isDownloading, setIsDownloading] = useState(false);
  const { currentPreset } = useTemplateState();

  // Get dimensions from current preset
  const width = currentPreset?.width ?? 1920;
  const height = currentPreset?.height ?? 1080;

  const handleDownload = async () => {
    if (!width || !height) return;

    setIsDownloading(true);
    await document.fonts.ready;

    const node = document.getElementById("image-overlay");
    if (node) {
      try {
        const options: Options = {
          skipFonts: false,
          imagePlaceholder: `https://placehold.co/${width}x${height}?text=Error+loading+image`,
          width,
          height,
          pixelRatio: 1,
          style: {
            width: `${width}px`,
            height: `${height}px`,
            transform: "none",
          },
          fetchRequestInit: {
            mode: "cors",
          },
          cacheBust: true,
        };

        const dataUrl =
          format === "png" ? await toPng(node, options) : await toJpeg(node, { ...options, quality: 1.0 });

        const link = document.createElement("a");
        link.download = `${filename}.${format}`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to generate image. Check if you have broken image URLs", error);
      } finally {
        setIsDownloading(false);
      }
    } else {
      setIsDownloading(false);
    }
  };
  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <Flex gap="2" direction="column">
          <Text size="2">Output file name</Text>
          <TextField.Root
            id="filename"
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Enter filename"
          />
        </Flex>
      </div>
      <div style={{ marginBottom: "24px" }}>
        <Flex gap="2" direction="column">
          <Text size="2">Filetype</Text>
          <Select.Root value={format} onValueChange={setFormat}>
            <Select.Trigger id="filetype" style={{ marginRight: "10px", width: "100%" }}>
              {format.toUpperCase()} • ({width}x{height})
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="png">PNG</Select.Item>
              <Select.Item value="jpg">JPG</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </div>
      <Button onClick={handleDownload} style={{ width: "100%" }} disabled={isDownloading}>
        {isDownloading ? <LuLoader className={styles.animateSpin} /> : <LuDownload />}
        Download
      </Button>
    </div>
  );
};

export default DownloadButton;
