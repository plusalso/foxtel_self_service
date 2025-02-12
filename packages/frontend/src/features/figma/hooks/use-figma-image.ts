export const getS3ImageUrl = (fileId: string, pageName: string, assetId: string) => {
  console.log("getting s3 image url", fileId, pageName, assetId);
  // const encodedFileId = fileId.replace(/ /g, "+");
  const encodedPage = pageName.replace(/ /g, "+");
  const encodedAssetId = assetId.replace(":", "%3A");

  return `https://foxtel-figma-self-service-assets.s3.ap-southeast-2.amazonaws.com/figma-cache/${encodedPage}/${encodedAssetId}`;
};
