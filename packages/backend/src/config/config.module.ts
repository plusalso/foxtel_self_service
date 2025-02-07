import dotenv from 'dotenv';
import { IAppConfig } from './config.model';
import { Global, Logger, Module } from '@nestjs/common';
import { getSecretsFromSsm } from './getSecretsFromSsm';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
console.log('REGION', process.env.AWS_REGION);
let _internalConfig: IAppConfig | null = null;

const logger = new Logger('ConfigModule');

export async function getConfigService() {
  logger.log('Getting config service from SSM');
  if (!_internalConfig) {
    _internalConfig = await getSecretsFromSsm(
      process.env.AWS_REGION || 'ap-southeast-2',
    );
  }
  console.log(_internalConfig);
  return _internalConfig;
}

export const configServiceProvider = {
  provide: 'AppConfig',
  useFactory: getConfigService,
};

@Global()
@Module({
  providers: [configServiceProvider],
  exports: ['AppConfig'],
})
export class ConfigModule {}
