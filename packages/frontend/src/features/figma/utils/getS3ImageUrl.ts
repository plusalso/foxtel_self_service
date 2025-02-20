import { useTemplate } from "../context/TemplateContext";

export const getS3ImageUrl = (fileId: string, pageName: string, assetId: string) => {
  const { imageVersion } = useTemplate();

  // const encodedFileId = fileId.replace(/ /g, "+");
  const encodedPage = pageName.replace("+", "%2B").replace(/ /g, "+");

  const encodedAssetId = assetId.replace(":", "%3A");
  console.log("fileId", fileId);

  return `https://foxtel-figma-self-service-assets.s3.ap-southeast-2.amazonaws.com/figma-cache/${encodedPage}/${encodedAssetId}?v=${imageVersion}`;
  // return `https://d3rjy3jq4dylp.cloudfront.net/figma-cache/${encodedPage}/${encodedAssetId}`;
};
