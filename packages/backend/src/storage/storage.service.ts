import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Inject, Injectable } from '@nestjs/common';
import { IAppConfig } from 'src/config/config.model';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  constructor(@Inject('AppConfig') private readonly appConfig: IAppConfig) {
    this.s3Client = new S3Client({
      region: this.appConfig.storage.region,
    });
  }

  async getPutObjectSignedUrl(key: string, expires: number) {
    const command = new PutObjectCommand({
      Bucket: this.appConfig.storage.bucket,
      Key: key,
    });
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expires,
      signingRegion: this.appConfig.storage.region,
    });
    return url;
  }

  async getGetObjectSignedUrl(key: string, expires: number) {
    const command = new GetObjectCommand({
      Bucket: this.appConfig.storage.bucket,
      Key: key,
    });
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expires,
    });
    return url;
  }

  public getNewImageKey = (
    fileExtension: string = '',
    prefix: string = 'image-',
  ) => {
    return `${this.appConfig.stage}/${prefix}${crypto.randomUUID()}${fileExtension && fileExtension.length > 0 ? `.${fileExtension.trim()}` : ''}`;
  };

  async uploadBlob(key: string, data: Blob) {
    const command = new PutObjectCommand({
      Bucket: this.appConfig.storage.bucket,
      Key: key,
      Body: Buffer.from(await data.arrayBuffer()),
    });

    console.log(
      'Uploading ',
      key,
      ' to bucket ',
      this.appConfig.storage.bucket,
    );

    await this.s3Client.send(command);
  }

  async headObject(key: string) {
    const command = new HeadObjectCommand({
      Bucket: this.appConfig.storage.bucket,
      Key: key,
    });
    try {
      const response = await this.s3Client.send(command);
      console.log(response);
      return true;
    } catch {
      return false;
    }
  }

  async getObject(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.appConfig.storage.bucket,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      return response.Body;
    } catch (error) {
      if ((error as any).name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  }
  async getObjectMetadata(key: string): Promise<Record<string, string> | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.appConfig.storage.bucket,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      return response.Metadata || null;
    } catch (error) {
      if (
        (error as any).name === 'NotFound' ||
        (error as any).name === 'NoSuchKey'
      ) {
        return null;
      }
      throw error;
    }
  }
  async deleteObject(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.appConfig.storage.bucket,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  async putObject(
    key: string,
    data: Buffer | string,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
    },
  ) {
    const command = new PutObjectCommand({
      Bucket: this.appConfig.storage.bucket,
      Key: key,
      Body: data,
      ContentType: options?.contentType,
      Metadata: options?.metadata,
    });

    await this.s3Client.send(command);
    return this.getPublicUrl(key);
  }

  async upload(params: {
    key: string;
    body: Buffer | string | Blob;
    contentType?: string;
    metadata?: Record<string, string>;
  }) {
    const { key, body, contentType, metadata } = params;

    let processedBody = body;
    if (body instanceof Blob) {
      processedBody = Buffer.from(await body.arrayBuffer());
    }

    const command = new PutObjectCommand({
      Bucket: this.appConfig.storage.bucket,
      Key: key,
      Body: processedBody,
      ContentType: contentType,
      Metadata: metadata,
    });

    await this.s3Client.send(command);
    return this.getPublicUrl(key);
  }

  getPublicUrl(key: string): string {
    return `https://${this.appConfig.storage.bucket}.s3.${this.appConfig.storage.region}.amazonaws.com/${key}`;
  }
}
