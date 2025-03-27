//@ts-ignore
export const getS3ImageUrl = (fileId: string, pageName: string, assetId: string, imageVersion?: number) => {
  // const encodedFileId = fileId.replace(/ /g, "+");
  const encodedPage = pageName.replace("+", "%2B").replace(/ /g, "+");

  const encodedAssetId = assetId.replace(":", "%3A");
  // console.log("fileId", fileId);

  //todo add fileId to prevent name collisions
  return `https://foxtel-figma-self-service-assets.s3.ap-southeast-2.amazonaws.com/figma-cache/${encodedPage}/${encodedAssetId}${
    imageVersion ? `?v=${imageVersion}` : ""
  }`;
  // return `https://d3rjy3jq4dylp.cloudfront.net/figma-cache/${encodedPage}/${encodedAssetId}`;
};
