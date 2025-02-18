import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
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

  @Get('file-nodes')
  getFileNodes(
    @Query('fileId') fileId: string,
    @Query('nodeIds') nodeIds: string,
    @Query('depth') depth?: number,
  ) {
    const nodeIdsArray = nodeIds.split(',');
    return this.figmaService.getFileNodes(fileId, nodeIdsArray, {
      depth,
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

  @Post('cache-assets')
  async cacheAssets(@Body() body: { fileId: string; nodeIds: string[] }) {
    console.log('Caching assets', body.fileId, body.nodeIds);
    const result = await this.figmaService.cacheAssets(
      body.fileId,
      body.nodeIds,
    );

    return result;
  }

  @Get('file-version')
  getFileVersion(@Query('fileId') fileId: string) {
    return this.figmaService.getFileVersion(fileId);
  }

  @Get('assets')
  async getAssets(
    @Query('fileId') fileId: string,
    @Query('pages') pages: string,
  ) {
    if (!fileId || !pages) {
      throw new BadRequestException('fileId and pages are required');
    }

    const pagesList = pages.split(',').filter(Boolean);
    return this.figmaService.getAssets(fileId, pagesList);
  }

  @Get('job-status')
  async getJobStatus(@Query('jobId') jobId: string) {
    if (!jobId) {
      throw new BadRequestException('jobId query parameter is required');
    }
    return this.figmaService.getJobStatus(jobId);
  }
}
