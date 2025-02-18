import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { FigmaAsset, FigmaTemplate, FigmaTemplateResponse } from './template';
import { createHash } from 'crypto';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

interface GetFileOptions {
  nodeIds?: string[];
  depth?: number;
  geometry?: 'paths' | 'bounds';
}

interface GetFileNodesOptions {
  version?: string;
  depth?: number;
  geometry?: 'paths';
  pluginData?: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

export interface FigmaAssetResponse {
  id: string;
  name: string;
  pageName: string;
}

@Injectable()
export class FigmaService {
  private readonly FIGMA_API_BASE = 'https://api.figma.com/v1';
  private readonly figmaToken = process.env.FIGMA_ACCESS_TOKEN;

  constructor(private readonly storageService: StorageService) {}

  async getFile(fileId: string, options: GetFileOptions = {}) {
    const params = new URLSearchParams();
    if (options.nodeIds) params.append('ids', options.nodeIds.join(','));
    if (options.depth) params.append('depth', options.depth.toString());
    if (options.geometry) params.append('geometry', options.geometry);

    const url = `${this.FIGMA_API_BASE}/files/${fileId}${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': this.figmaToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error for url ${url}: ${response}`);
    }

    return response.json();
  }

  async getFileNodes(
    fileId: string,
    nodeIds: string[],
    options: GetFileNodesOptions = {},
  ) {
    const params = new URLSearchParams();
    params.append('ids', nodeIds.join(','));
    if (options.version) params.append('version', options.version);
    if (options.depth) params.append('depth', options.depth.toString());
    if (options.geometry) params.append('geometry', options.geometry);
    if (options.pluginData) params.append('plugin_data', options.pluginData);

    const url = `${this.FIGMA_API_BASE}/files/${fileId}/nodes?${params.toString()}`;
    console.log('getting file nodes', url);
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': this.figmaToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error for url ${url}: ${response}`);
    }

    return response.json();
  }

  // Helper method to get just the pages list
  async getPages(fileId: string) {
    const file = await this.getFile(fileId, { depth: 1 });
    return file.document.children.map((page: any) => ({
      id: page.id,
      name: page.name,
      type: page.type,
    }));
  }

  async getImages(
    fileId: string,
    nodeIds: string[],
  ): Promise<{ images: Record<string, string> }> {
    console.log('getting images', fileId, nodeIds);
    const response = await fetch(
      `${this.FIGMA_API_BASE}/images/${fileId}?ids=${nodeIds.join(',')}&format=png&scale=1`,
      {
        headers: {
          'X-Figma-Token': this.figmaToken,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getPageAssets(fileId: string, pageId: string): Promise<FigmaAsset[]> {
    try {
      const response = await this.getFileNodes(fileId, [pageId], { depth: 1 });
      const page = response?.nodes?.[pageId]?.document;

      if (!page?.children?.length) {
        return [];
      }
      return page.children
        .filter((node) => node?.id && node?.name)
        .map(({ id, name }) => ({ id, name }));
    } catch (error) {
      console.error('Error in getPageAssets:', error);
      return [];
    }
  }

  /**
   * Gets the version of the file from the Figma API
   */
  async getFileVersion(fileId: string): Promise<string> {
    const data = await this.getFile(fileId, { depth: 1 });
    return data.version;
  }

  /**
   * Sets the version of the file that is stored in the cache
   */
  async setCachedFileVersion(fileId: string, version: string): Promise<void> {
    const key = `figma-file-versions/${fileId}.json`;
    const data = JSON.stringify({ version });
    await this.storageService.putObject(key, data, {
      contentType: 'application/json',
    });
  }

  async getCachedFileVersion(fileId: string): Promise<string | null> {
    const key = `figma-file-versions/${fileId}.json`;
    const data = await this.storageService.getObject(key);
    if (!data) {
      return null;
    }
    const parsedData = JSON.parse(data.toString());
    return parsedData.version;
  }

  async getTemplates(
    fileId: string,
    templateNames?: string[],
  ): Promise<FigmaTemplateResponse> {
    const pages = await this.getPages(fileId);
    const templates = new Map<string, FigmaTemplate>();
    console.log('templatenames', templateNames);
    // Find all template pages
    const templatePages = pages.filter((page) =>
      page.name.endsWith('/Template'),
    );

    if (templatePages.length === 0) {
      throw new Error('No template pages found');
    }

    // get the part before the / to get the prefix
    const assetPageIds = pages
      .filter((page) => page.name.includes('/'))
      .map((page) => page.id);

    // Fetch nodes for all template pages at once
    const nodesResponse = await this.getFileNodes(fileId, assetPageIds, {
      depth: 2,
    });
    console.log('nodesResponse', nodesResponse);
    for (const templatePage of templatePages) {
      const templatePageNode = nodesResponse.nodes[templatePage.id]?.document;
      const templatePrefix = templatePage.name.split('/')[0];
      console.log(
        `reading template page ${templatePage.name}. Found ${templatePageNode?.children?.length} frames`,
      );
      if (!templatePageNode || !templatePageNode.children) {
        continue; // Skip if no frames found in the template page
      }

      // Parse frames to extract template and group information
      for (const frame of templatePageNode.children) {
        console.log(`reading frame ${frame.name}`);
        const parts = frame.name.split('/');
        const templateName = parts.shift();
        console.log(`templateName ${templateName}`);
        if (!templateName) continue;

        // if (templateNames && !templateNames.includes(templateName)) continue;

        if (!templates.has(templateName)) {
          templates.set(templateName, {
            name: templateName,
            prefix: templatePrefix,
            groups: [],
          });
        }

        const template = templates.get(templateName);

        // Create groups based on the remaining parts
        parts.forEach((groupName, index) => {
          const groupId = `${frame.id}:${index}`;
          const existingGroup = template.groups.find(
            (group) => group.name === groupName,
          );

          if (!existingGroup) {
            template.groups.push({
              name: groupName,
              id: groupId,
              assets: [],
            });
          }
        });

        // Extract assets from the corresponding page
        for (const group of template.groups) {
          const pageName = `${templatePrefix}/${group.name}`;
          console.log(`getting assets for pageName ${pageName}`);
          const page = pages.find((p) => p.name === pageName);
          if (page) {
            console.log(`found page ${page}`);
            const pageNodes = nodesResponse.nodes[page.id]?.document?.children;
            console.log(`pageNodes ${pageNodes}`);
            if (pageNodes) {
              group.assets = pageNodes
                .filter((node) => node?.id && node?.name)
                .map(({ id, name }) => ({ id, name }));
            }
          }
        }
      }
    }

    return {
      templates: Array.from(templates.values()),
    };
  }
  //fast hash
  async createNodeHash(node: any): Promise<string> {
    return createHash('sha256').update(JSON.stringify(node)).digest('hex');
  }

  async cacheAssets(fileId: string, pageNodeIds: string[]) {
    console.log(`Starting to cache assets for file ${fileId}`);

    // Get the full file nodes for the specified pageNodeIds
    const file = await this.getFileNodes(fileId, pageNodeIds);
    console.log('Page nodes', pageNodeIds);

    const assetsToUpdate: Array<{
      pageName: string;
      assetId: string;
      assetName: string;
      hash: string;
    }> = [];

    for (const [nodeId, pageData] of Object.entries(file.nodes)) {
      console.log('looking for children of', nodeId);
      const page = pageData as { document: FigmaNode; id: string };
      const pageName = page.document.name;
      for (const child of page.document.children) {
        const assetId = child.id;
        const assetName = child.name;
        const hash = await this.createNodeHash(child);
        console.log('hash', hash);
        const key = `figma-cache/${pageName}/${assetId}`;
        try {
          const metadata = await this.storageService.getObjectMetadata(key);
          console.log('current metadata', metadata);
          if (!metadata || metadata.hash !== hash) {
            console.log(`Asset ${assetName} needs to be updated.`);
            assetsToUpdate.push({
              pageName,
              assetId,
              assetName,
              hash,
            });
          } else {
            console.log(`Asset ${assetName} is up to date in S3.`);
          }
        } catch (error) {
          console.log('Error caching asset', error);
        }
      }
    }

    console.log('assetsToUpdate', assetsToUpdate);
    // Invoke the download/upload lambda asynchronously (fire-and-forget) so that the long-running process doesn't block the current lambda.
    const jobId = uuidv4();
    if (assetsToUpdate.length === 0) {
      console.log('No assets to update. Returning early.');
      return {
        jobId: null,
        assetsToUpdate,
      };
    }

    // write a started marker file
    const markerKey = `job-markers/${jobId}.json`;
    const markerData = {
      jobId,
      status: 'started',
      fileId,
      assetsCount: assetsToUpdate.length,
      startedAt: new Date().toISOString(),
    };
    try {
      await this.storageService.putObject(
        markerKey,
        Buffer.from(JSON.stringify(markerData)),
        { contentType: 'application/json' },
      );
      console.log(`Marker file ${markerKey} created`);
    } catch (markerError) {
      console.error('Error creating marker file:', markerError);
    }

    const lambdaClient = new LambdaClient({
      region: process.env.AWS_REGION || 'ap-southeast-2',
      ...(process.env.STAGE === 'local' && {
        endpoint: 'http://localhost:3002',
      }),
    });

    // Ensure the function name is set via env var so it works in both local and prod environments.
    const functionName = process.env.DOWNLOAD_UPLOAD_ASSETS_FUNCTION_NAME;
    if (!functionName) {
      console.error('DOWNLOAD_UPLOAD_ASSETS_FUNCTION_NAME env var is not set.');
    } else {
      // Pass jobId in the payload
      const payload = {
        fileId,
        assets: assetsToUpdate,
        jobId,
      };
      console.log('invoking lambda:', functionName);
      const command = new InvokeCommand({
        FunctionName: functionName,
        InvocationType: 'Event', // asynchronous invocation (fire-and-forget)
        Payload: Buffer.from(JSON.stringify(payload)),
      });
      try {
        await lambdaClient.send(command);
        console.log('Asynchronous lambda invoked for downloadAndUploadAssets');
      } catch (invokeError) {
        console.error('Error invoking asynchronous lambda:', invokeError);
      }
    }

    return {
      jobId,
      assetsToUpdate,
    };
  }

  async downloadAndUploadAssets(
    fileId: string,
    jobId: string,
    assets: Array<{
      pageName: string;
      assetId: string;
      assetName: string;
      hash: string;
    }>,
  ) {
    console.log('downloading and uploading. JobId', jobId);
    const batchSize = 20; // Define a sensible batch size
    try {
      const startTime = Date.now();
      for (let i = 0; i < assets.length; i += batchSize) {
        const batch = assets.slice(i, i + batchSize);

        const assetIds = batch.map((asset) => asset.assetId);
        console.log(
          `Getting images for ${assetIds.length} assets. Assets from ${i} to ${i + batchSize} of ${assets.length}`,
        );
        const figmaImages = await this.getImages(fileId, assetIds);
        console.log('figmaImages', figmaImages);
        //log elapsed time
        const elapsedTime = Date.now() - startTime;
        console.log(`Elapsed time: ${elapsedTime / 1000} seconds`);
        for (const asset of batch) {
          const imageUrl = figmaImages.images[asset.assetId];
          if (!imageUrl) {
            console.warn(`No image URL found for asset ${asset.assetId}`);
            continue;
          }
          console.log(`Downloading asset ${asset.assetName} from ${imageUrl}`);
          const response = await fetch(imageUrl);
          console.log(`Downloaded asset ${asset.assetName} from ${imageUrl}`);
          const buffer = Buffer.from(await response.arrayBuffer());

          const calcSizeInMB = (buffer: Buffer) => {
            return (buffer.length / 1024 / 1024).toFixed(2);
          };

          const key = `figma-cache/${asset.pageName}/${asset.assetId}`;
          console.log(
            `Uploading asset ${asset.assetName} to S3. Size ${calcSizeInMB(buffer)} MB`,
          );
          await this.storageService.putObject(key, buffer, {
            contentType: 'image/png',
            metadata: { hash: asset.hash },
          });
          console.log(`Uploaded asset ${asset.assetName} to S3.`);
        }
      }
      console.log(`Uploaded ${assets.length} assets. Complete`);

      // On success, update marker to completed.
      if (jobId) {
        const markerData = {
          jobId,
          status: 'completed',
          fileId,
          assetsCount: assets.length,
          completedAt: new Date().toISOString(),
        };
        const markerKey = `job-markers/${jobId}.json`;
        await this.storageService.putObject(
          markerKey,
          Buffer.from(JSON.stringify(markerData)),
          { contentType: 'application/json' },
        );
        console.log(`Marker file ${markerKey} updated to completed`);
      }
    } catch (error) {
      console.error('Error downloading and uploading assets', error);
      // Update marker to failed on error
      if (jobId) {
        const markerData = {
          jobId,
          status: 'failed',
          fileId,
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date().toISOString(),
        };
        const markerKey = `job-markers/${jobId}.json`;
        await this.storageService.putObject(
          markerKey,
          Buffer.from(JSON.stringify(markerData)),
          { contentType: 'application/json' },
        );
        console.log(`Marker file ${markerKey} updated to failed`);
      }
      throw error;
    }
  }

  async getAssets(
    fileId: string,
    pages: string[],
  ): Promise<Record<string, FigmaAssetResponse[]>> {
    // First get just the pages to find the IDs we need
    const allPages = await this.getPages(fileId);
    const targetPageIds = allPages
      .filter((page) => pages.includes(page.name))
      .map((page) => page.id);

    console.log('targetPageIds', targetPageIds);
    console.log('pages', pages);
    if (targetPageIds.length === 0) {
      return {};
    }

    // Fetch only the needed pages with their frames
    const nodesResponse = await this.getFileNodes(fileId, targetPageIds, {
      depth: 1,
    });
    const response: Record<string, FigmaAssetResponse[]> = {};
    console.log('nodesResponse', nodesResponse);
    // Process each page's frames
    Object.values(nodesResponse.nodes).forEach((pageData) => {
      const page = pageData as { document: FigmaNode; id: string };
      const pageName = page.document.name;
      const pageId = page.document.id;

      if (page.document.children) {
        response[pageName] = page.document.children.map((frame) => ({
          id: frame.id,
          name: frame.name,
          pageName,
          pageId: pageId,
        }));
      }
    });

    return response;
  }

  async getJobStatus(jobId: string): Promise<any> {
    const markerKey = `job-markers/${jobId}.json`;
    try {
      const marker = await this.storageService.getObject(markerKey);
      if (!marker) {
        return {
          jobId,
          status: 'pending',
          message:
            'Job marker not available yet, the job might still be processing',
        };
      }

      // Check if marker is a stream (which it typically is)
      if (marker instanceof Readable) {
        const markerStr = await this.streamToString(marker);
        return JSON.parse(markerStr);
      } else {
        // Otherwise, if marker is already a Buffer or string, handle accordingly.
        const resultStr = Buffer.isBuffer(marker)
          ? marker.toString('utf8')
          : marker.toString();
        return JSON.parse(resultStr);
      }
    } catch (error) {
      console.error('Error retrieving job status', error);
      throw new Error('Failed to get job status');
    }
  }

  // Helper: Convert a Readable stream to a string.
  private async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf8');
  }
}
