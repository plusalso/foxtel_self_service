import { useQuery } from "@tanstack/react-query";
import { getFigmaImages } from "../api/get-figma-images";

export const getS3ImageUrl = (templateName: string, groupName: string, assetId: string) => {
  const encodedTemplate = templateName.replace(/ /g, "+");
  const encodedGroup = groupName.replace(/ /g, "+");
  const encodedAssetId = assetId.replace(":", "%3A");

  // const versionSuffix = version ? `-v${version}` : "";

  return `https://foxtel-figma-self-service-assets.s3.ap-southeast-2.amazonaws.com/figma-cache/${encodedTemplate}/${encodedGroup}/${encodedAssetId}`;
};
export const useFigmaImage = (fileId: string, templateName: string, groupName: string, assetId: string) => {
  return useQuery({
    queryKey: ["figma-image", fileId, assetId],
    queryFn: async () => {
      // First try to load from S3
      const s3Url = getS3ImageUrl(templateName, groupName, assetId);

      try {
        // Test if image exists by trying to load it
        const response = await fetch(s3Url, { method: "HEAD" });
        if (response.ok) {
          return s3Url;
        }
      } catch (error) {
        // S3 image doesn't exist, continue to Figma API
      }

      // Fallback to Figma API
      const figmaImages = await getFigmaImages(fileId, [assetId]);
      const imageUrl = figmaImages.images[assetId];

      if (!imageUrl) {
        throw new Error(`No image found for asset ${assetId}`);
      }

      // Cache the image to S3 in the background
      fetch("/api/figma/cache-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          templateName,
          groupName,
          assetId,
          imageUrl,
        }),
      }).catch(console.error); // Handle silently since this is background caching

      return imageUrl;
    },
  });
};

export const useFigmaTemplateAssets = (fileId: string, templateName: string) => {
  return useQuery({
    queryKey: ["figma-template-assets", fileId, templateName],
    queryFn: async () => {
      const response = await fetch(`/api/figma/template-assets?fileId=${fileId}&templateName=${templateName}`);
      return response.json();
    },
    enabled: Boolean(fileId && templateName),
  });
};
