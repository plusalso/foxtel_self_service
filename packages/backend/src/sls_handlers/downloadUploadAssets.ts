console.log('starting downloadUploadAssets module');
import { Handler } from 'aws-lambda';
import { bootstrapApp } from '../bootstrap';
import { FigmaService } from '../figma/figma.service';

let appPromise: Promise<any> | undefined;

const getFigmaService = async (): Promise<FigmaService> => {
  if (!appPromise) {
    appPromise = bootstrapApp();
  }
  const app = await appPromise;
  return app.get(FigmaService);
};

// This handler is used to download and upload assets from Figma to S3
export const handler: Handler = async (event) => {
  console.log('starting downloadAndUploadAssets');
  try {
    const { fileId, assets, jobId } = event;
    if (!fileId || !assets) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing fileId or assets' }),
      };
    }
    console.log(
      `Getting figma service to parse ${fileId} with ${assets.length} assets`,
    );
    const figmaService = await getFigmaService();
    console.log('Downloading and uploading assets');
    await figmaService.downloadAndUploadAssets(fileId, jobId, assets);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Assets processed successfully' }),
    };
  } catch (error: any) {
    console.error('Error processing assets:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process assets',
        details: error.message,
      }),
    };
  }
};
