import { useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import { Button, Select, TextField } from "@radix-ui/themes";

const DownloadButton = () => {
  const [filename, setFilename] = useState("composited-image");
  const [format, setFormat] = useState("png");

  const handleDownload = async () => {
    const node = document.getElementById("image-overlay");
    if (node) {
      try {
        const dataUrl = format === "png" ? await toPng(node) : await toJpeg(node, { quality: 0.95 });
        const link = document.createElement("a");
        link.download = `${filename}.${format}`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to generate image. Check if you have broken image URLs", error);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <div>
          <label htmlFor="filename">Output file name</label>
        </div>
        <TextField.Root
          id="filename"
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Enter filename"
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <div>
          <label htmlFor="filetype">Filetype</label>
        </div>
        <Select.Root value={format} onValueChange={setFormat}>
          <Select.Trigger id="filetype" style={{ marginRight: "10px", width: "100%" }}>
            {format.toUpperCase()}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="png">PNG</Select.Item>
            <Select.Item value="jpg">JPG</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
      <Button onClick={handleDownload}>Download</Button>
    </div>
  );
};

export default DownloadButton;
