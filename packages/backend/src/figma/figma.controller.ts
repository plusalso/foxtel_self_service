import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { FigmaService } from './figma.service';
import { FigmaTemplateResponse } from './template';
import { StorageService } from 'src/storage/storage.service';

@Controller('figma')
export class FigmaController {
  constructor(
    private readonly figmaService: FigmaService,
    private readonly storageService: StorageService,
  ) {}

  @Get('file')
  getFile(
    @Query('fileId') fileId: string,
    @Query('nodeIds') nodeIds?: string,
    @Query('depth') depth?: number,
    @Query('geometry') geometry?: 'paths' | 'bounds',
  ) {
    const nodeIdsArray = nodeIds ? nodeIds.split(',') : undefined;
    return this.figmaService.getFile(fileId, {
      nodeIds: nodeIdsArray,
      depth,
      geometry,
    });
  }

  @Get('pages')
  getPages(@Query('fileId') fileId: string) {
    return this.figmaService.getPages(fileId);
  }

  @Get('images')
  getImages(
    @Query('fileId') fileId: string,
    @Query('nodeIds') nodeIds: string,
  ) {
    const nodeIdsArray = nodeIds.split(',');
    return this.figmaService.getImages(fileId, nodeIdsArray);
  }

  @Get('templates')
  async getTemplates(
    @Query('fileId') fileId: string,
    @Query('templateNames') templateNames?: string[],
  ): Promise<FigmaTemplateResponse> {
    return this.figmaService.getTemplates(fileId, templateNames);
  }

  @Post('sync-assets')
  async syncTemplateAssets(
    @Body() body: { fileId: string; pageNodeIds: string[] },
  ) {
    console.log('Syncing template assets', body.fileId, body.pageNodeIds);
    const result = await this.figmaService.cacheAssets(
      body.fileId,
      body.pageNodeIds,
    );

    return result;
  }

  @Get('file-version')
  getFileVersion(@Query('fileId') fileId: string) {
    return this.figmaService.getFileVersion(fileId);
  }
}
