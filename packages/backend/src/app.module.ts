import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { TestModule } from './test/test.module';
import { FigmaModule } from './figma/figma.module';
import { StorageModule } from './storage/storage.module';

const extraModules = [];

if (['local', 'stage'].includes(process.env.STAGE)) {
  extraModules.push(TestModule);
}
console.log('STAGE', process.env.STAGE);
@Module({
  imports: [ConfigModule, FigmaModule, StorageModule, ...extraModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
