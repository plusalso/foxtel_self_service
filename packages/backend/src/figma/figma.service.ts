import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { FigmaAsset, FigmaTemplate, FigmaTemplateResponse } from './template';
import { createHash } from 'crypto';

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

  // async getTemplateAssets(
  //   fileId: string,
  //   templateName: string,
  //   groupName: string,
  //   assets: FigmaAsset[],
  // ): Promise<AssetWithCache[]> {
  //   // Get current file version for cache key
  //   console.log('getting file version', fileId);
  //   const fileVersion = await this.getFileVersion(fileId);
  //   console.log('fileVersion', fileVersion);
  //   // Check cache status for all assets
  //   const assetResults = await Promise.all(
  //     assets.map(async (asset) => {
  //       const key = `figma-cache/${templateName}/${groupName}/${asset.id}-v${fileVersion}.png`;
  //       const exists = await this.storageService.headObject(key);
  //       return {
  //         id: asset.id,
  //         name: asset.name,
  //         groupName,
  //         exists,
  //         key,
  //       };
  //     }),
  //   );

  //   // Get missing images from Figma
  //   const missingAssetIds = assetResults
  //     .filter((a) => !a.exists)
  //     .map((a) => a.id);

  //   if (missingAssetIds.length > 0) {
  //     const figmaImages = await this.getImages(fileId, missingAssetIds);

  //     // Cache missing images in S3
  //     await Promise.all(
  //       assetResults
  //         .filter((asset) => !asset.exists)
  //         .map(async (asset) => {
  //           const imageUrl = figmaImages.images[asset.id];
  //           if (!imageUrl) return;

  //           const response = await fetch(imageUrl);
  //           const buffer = Buffer.from(await response.arrayBuffer());

  //           await this.storageService.upload({
  //             key: asset.key,
  //             body: buffer,
  //             contentType: 'image/png',
  //           });
  //         }),
  //     );
  //   }

  //   // Return all asset URLs
  //   return assetResults.map((asset) => ({
  //     id: asset.id,
  //     groupName: asset.groupName,
  //     assetName: asset.name,
  //     url: this.storageService.getPublicUrl(asset.key),
  //   }));
  // }

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

  // async getTemplates(
  //   fileId: string,
  //   templateNames?: string[],
  // ): Promise<FigmaTemplateResponse> {
  //   const pages = await this.getPages(fileId);
  //   const templates = new Map<string, FigmaTemplate>();

  //   // Collect all page IDs
  //   const pageIds = pages.map((page) => page.id);

  //   // Fetch all nodes for the collected page IDs
  //   const nodesResponse = await this.getFileNodes(fileId, pageIds, {
  //     depth: 1,
  //   });

  //   for (const page of pages) {
  //     const [templateName, groupName] = page.name.split('/');
  //     if (!groupName) continue;
  //     if (templateNames && !templateNames.includes(templateName)) continue;

  //     if (!templates.has(templateName)) {
  //       templates.set(templateName, {
  //         name: templateName,
  //         groups: [],
  //       });
  //     }

  //     const template = templates.get(templateName);
  //     const pageNode = nodesResponse.nodes[page.id]?.document;

  //     if (pageNode && pageNode.children) {
  //       const assets = pageNode.children
  //         .filter((node) => node?.id && node?.name)
  //         .map(({ id, name }) => ({ id, name }));

  //       template.groups.push({
  //         name: groupName,
  //         id: page.id,
  //         assets: assets.map((asset, index) => ({
  //           id: asset.id,
  //           name: asset.name,
  //           order: index,
  //         })),
  //       });
  //     }
  //   }

  //   return {
  //     templates: Array.from(templates.values()),
  //   };
  // }
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
            console.log(`Asset ${assetName} is up-to-date in S3.`);
          }
        } catch (error) {
          console.log('Error caching asset', error);
        }
      }
    }

    console.log('assetsToUpdate', assetsToUpdate);
    //now we need to download and upload the assets
    this.downloadAndUploadAssets(fileId, assetsToUpdate);

    return {
      assetsToUpdate,
    };
  }
  chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async processImagesInBatches(
    fileId: string,
    imageIds: string[],
  ): Promise<{ images: Record<string, string> }> {
    const imageChunks = this.chunkArray(imageIds, 20);
    const allImages: Record<string, string> = {};

    for (const chunk of imageChunks) {
      const figmaImages = await this.getImages(fileId, chunk);
      Object.assign(allImages, figmaImages.images);
    }

    return { images: allImages };
  }

  // async syncAssetsWithS3(
  //   fileId: string,
  //   assets: Array<{
  //     pageId: string;
  //     pageName: string;
  //     assetId: string;
  //     assetName: string;
  //     hash: string;
  //   }>,
  // ) {
  //   for (const asset of assets) {
  //     const key = `figma-cache/${asset.pageName}/${asset.assetName}`;
  //     const metadata = await this.storageService.getObjectMetadata(key);

  //     if (metadata && metadata.hash === asset.hash) {
  //       console.log(`Asset ${asset.assetName} is up-to-date in S3.`);
  //       continue;
  //     }

  //     console.log(`Fetching image for asset ${asset.assetName} from Figma.`);
  //     const figmaImages = await this.getImages(fileId, [asset.assetId]);
  //     const imageUrl = figmaImages.images[asset.assetId];

  //     if (!imageUrl) {
  //       console.warn(`No image URL found for asset ${asset.assetId}`);
  //       continue;
  //     }

  //     const response = await fetch(imageUrl);
  //     const buffer = Buffer.from(await response.arrayBuffer());

  //     console.log(`Uploading asset ${asset.assetName} to S3.`);
  //     await this.storageService.putObject(key, buffer, {
  //       contentType: 'image/png',
  //       metadata: { hash: asset.hash },
  //     });
  //   }
  // }

  async downloadAndUploadAssets(
    fileId: string,
    assets: Array<{
      pageName: string;
      assetId: string;
      assetName: string;
      hash: string;
    }>,
  ) {
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
    } catch (error) {
      console.error('Error downloading and uploading assets', error);
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
        response[pageName] = page.document.children
          .map((frame) => ({
            id: frame.id,
            name: frame.name,
            pageName,
            pageId: pageId,
          }));
      }
    });

    return response;
  }
}
