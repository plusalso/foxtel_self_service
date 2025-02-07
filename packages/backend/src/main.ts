import { bootstrapApp } from './bootstrap';

async function bootstrap() {
  console.log('process.env.STAGE', process.env.STAGE);

  const PORT = parseInt(process.env.NESTJS_PORT || '3006', 10);
  console.log(`nestJS backend started on port: ${PORT}`);
  const app = await bootstrapApp();
  await app.listen(PORT);
}
bootstrap();
