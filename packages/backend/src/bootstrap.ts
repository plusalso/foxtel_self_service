import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';

let app: INestApplication | null = null;

export async function bootstrapApp(): Promise<INestApplication> {
  console.log('Bootstrapping app');

  // print the time elapsed every 10 seconds
  const startTime = Date.now();
  setInterval(() => {
    console.log('Time elapsed in seconds', (Date.now() - startTime) / 1000);
  }, 10000);

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

/*
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
*/
