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

  async getTemplates(
    fileId: string,
    templateNames?: string[],
  ): Promise<FigmaTemplateResponse> {
    const pages = await this.getPages(fileId);
    const templates = new Map<string, FigmaTemplate>();

    // Collect all page IDs
    const pageIds = pages.map((page) => page.id);

    // Fetch all nodes for the collected page IDs
    const nodesResponse = await this.getFileNodes(fileId, pageIds, {
      depth: 1,
    });

    for (const page of pages) {
      const [templateName, groupName] = page.name.split('/');
      if (!groupName) continue;
      if (templateNames && !templateNames.includes(templateName)) continue;

      if (!templates.has(templateName)) {
        templates.set(templateName, {
          name: templateName,
          groups: [],
        });
      }

      const template = templates.get(templateName);
      const pageNode = nodesResponse.nodes[page.id]?.document;

      if (pageNode && pageNode.children) {
        const assets = pageNode.children
          .filter((node) => node?.id && node?.name)
          .map(({ id, name }) => ({ id, name }));

        template.groups.push({
          name: groupName,
          id: page.id,
          assets: assets.map((asset, index) => ({
            id: asset.id,
            name: asset.name,
            order: index,
          })),
        });
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
      pageId: string;
      pageName: string;
      assetId: string;
      assetName: string;
      hash: string;
    }> = [];

    for (const [pageId, pageData] of Object.entries(file.nodes)) {
      for (const child of (pageData as any).document.children) {
        const pageName = (pageData as any).document.name;
        const assetId = child.id;
        const assetName = child.name;
        const hash = await this.createNodeHash(child);
        console.log('hash', hash);
        const key = `figma-cache/${pageName}/${assetName}`;
        try {
          const metadata = await this.storageService.getObjectMetadata(key);
          console.log('metadata', metadata);
          if (!metadata || metadata.hash !== hash) {
            console.log(`Asset ${assetName} needs to be updated.`);
            assetsToUpdate.push({ pageId, pageName, assetId, assetName, hash });
          } else {
            console.log(`Asset ${assetName} is up-to-date in S3.`);
          }
        } catch (error) {
          console.log('Error caching asset', error);
        }
      }
    }

    console.log('assetsToUpdate', assetsToUpdate);

    // Call the function to handle downloading and uploading assets
    this.downloadAndUploadAssets(fileId, assetsToUpdate).catch((error) =>
      console.error('Error updating assets:', error),
    );

    return assetsToUpdate;
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
      pageId: string;
      pageName: string;
      assetId: string;
      assetName: string;
      hash: string;
    }>,
  ) {
    const batchSize = 5; // Define a sensible batch size

    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);

      const assetIds = batch.map((asset) => asset.assetId);
      console.log(
        `Getting images for ${assetIds.length} assets. Assets from ${i} to ${i + batchSize} of ${assets.length}`,
      );
      const figmaImages = await this.getImages(fileId, assetIds);
      console.log('figmaImages', figmaImages);
      for (const asset of batch) {
        const imageUrl = figmaImages.images[asset.assetId];
        if (!imageUrl) {
          console.warn(`No image URL found for asset ${asset.assetId}`);
          continue;
        }

        const response = await fetch(imageUrl);
        const buffer = Buffer.from(await response.arrayBuffer());

        const calcSizeInMB = (buffer: Buffer) => {
          return (buffer.length / 1024 / 1024).toFixed(2);
        };

        const key = `figma-cache/${asset.pageName}/${asset.assetName}`;
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
  }
}
