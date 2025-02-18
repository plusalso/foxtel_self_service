import dotenv from 'dotenv';
import { IAppConfig } from './config.model';
import { Global, Logger, Module } from '@nestjs/common';
import { getSecretsFromSsm } from './getSecretsFromSsm';
import path from 'path';
import AWS from 'aws-sdk';

console.log('Loading config module');
if (process.env.STAGE === 'local') {
  console.log('loading local env');
  dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
  console.log('loading aws config', process.env.AWS_ACCESS_KEY_ID);
  AWS.config.update({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    },
  });
}

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
