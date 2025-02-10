import { toPng } from "html-to-image";
import { Button } from "@radix-ui/themes";

const DownloadButton = () => {
  const handleDownload = async () => {
    const node = document.getElementById("image-overlay");
    if (node) {
      try {
        const dataUrl = await toPng(node);
        const link = document.createElement("a");
        link.download = "composited-image.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to generate image. Check if you have broken image urls", error);
      }
    }
  };

  return <Button onClick={handleDownload}>Download</Button>;
};

export default DownloadButton;
