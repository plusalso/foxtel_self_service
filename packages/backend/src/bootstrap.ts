import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';

let app: INestApplication | null = null;

export async function bootstrapApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      cors: true,
    });
    app.use(bodyParser.json({ limit: '6mb' })); // 6mb is the synchronous lambda limit

    app.enableCors();
    const config = new DocumentBuilder()
      .setTitle('plusalso rollout backend')
      .setDescription('PLUSALSO ROLLOUT API BACKEND')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/_doco', app, document);

    await app.init();
  }

  return app;
}
