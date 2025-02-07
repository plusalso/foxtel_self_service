import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import {
  AssetToSync,
  FigmaAsset,
  FigmaTemplate,
  FigmaTemplateResponse,
} from './template';

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
      throw new Error(`Figma API error: ${response.statusText}`);
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
      throw new Error(`Figma API error: ${response.statusText}`);
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

  async getImages(fileId: string, nodeIds: string[]) {
    const response = await fetch(
      `${this.FIGMA_API_BASE}/images/${fileId}?ids=${nodeIds.join(',')}&format=png&scale=2`,
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

  async getFileVersion(fileId: string): Promise<string> {
    const data = await this.getFile(fileId, { depth: 1 });
    return data.version;
  }

  async getTemplates(
    fileId: string,
    templateNames?: string[],
  ): Promise<FigmaTemplateResponse> {
    const pages = await this.getPages(fileId);
    const templates = new Map<string, FigmaTemplate>();

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
      const assets = await this.getPageAssets(fileId, page.id);

      template.groups.push({
        name: groupName,
        assets: assets.map((asset) => ({
          id: asset.id,
          name: asset.name,
        })),
      });
    }

    return {
      templates: Array.from(templates.values()),
    };
  }

  async cacheAssets(fileId: string, assets: AssetToSync[]): Promise<void> {
    console.log(`Starting to cache assets for file ${fileId}`);

    // Get current file version for cache key
    const fileVersion = await this.getFileVersion(fileId);
    console.log(`File version: ${fileVersion}`);

    // Group assets by template/group for efficient processing
    const assetsByGroup = assets.reduce(
      (acc, asset) => {
        const key = `${asset.templateName}/${asset.groupName}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(asset);
        return acc;
      },
      {} as Record<string, AssetToSync[]>,
    );

    console.log(`Processing ${Object.keys(assetsByGroup).length} asset groups`);

    // Process each group
    for (const [key, groupAssets] of Object.entries(assetsByGroup)) {
      const [templateName, groupName] = key.split('/');
      console.log(`Processing group ${key} with ${groupAssets.length} assets`);

      // Check which assets need caching
      const assetResults = await Promise.all(
        groupAssets.map(async (asset) => {
          const key = `figma-cache/${templateName}/${groupName}/${asset.id}-v${fileVersion}.png`;
          const exists = await this.storageService.headObject(key);
          return { ...asset, exists, key };
        }),
      );

      // Get missing images from Figma
      const missingAssets = assetResults.filter((a) => !a.exists);
      console.log(`Found ${missingAssets.length} uncached assets`);

      if (missingAssets.length > 0) {
        const figmaImages = await this.getImages(
          fileId,
          missingAssets.map((a) => a.id),
        );
        console.log(
          `Retrieved ${Object.keys(figmaImages.images).length} images from Figma`,
        );

        // Cache missing images in S3
        await Promise.all(
          missingAssets.map(async (asset) => {
            const imageUrl = figmaImages.images[asset.id];
            if (!imageUrl) {
              console.warn(`No image URL found for asset ${asset.id}`);
              return;
            }

            console.log(`Caching asset ${asset.id} to ${asset.key}`);
            const response = await fetch(imageUrl);
            const buffer = Buffer.from(await response.arrayBuffer());

            await this.storageService.upload({
              key: asset.key,
              body: buffer,
              contentType: 'image/png',
            });
          }),
        );
      }
    }

    console.log('Finished caching assets');
  }
}
