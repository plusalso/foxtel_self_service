import { useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import { Button, Flex, Select, Text, TextField } from "@radix-ui/themes";
import { Options } from "html-to-image/lib/types";
import { LuDownload, LuLoader } from "react-icons/lu";
import styles from "./DownloadButton.module.scss";
const DownloadButton = () => {
  const [filename, setFilename] = useState("composited-image");
  const [format, setFormat] = useState("png");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    await document.fonts.ready;

    const node = document.getElementById("image-overlay");
    if (node) {
      try {
        const options: Options = {
          fontEmbedCSS:
            '@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap");',
          skipFonts: false,
          imagePlaceholder: "https://placehold.co/1920x1080?text=Error+loading+image",
          width: 1920,
          height: 1080,
          pixelRatio: 1,
          style: {
            width: "1920px",
            height: "1080px",
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
              {format.toUpperCase()}
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
