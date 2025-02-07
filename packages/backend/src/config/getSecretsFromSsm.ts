import { parse } from 'jsonc-parser';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { IAppConfig } from '../config/config.model';

export const getSecretsFromSsm = async (
  region: string,
): Promise<IAppConfig> => {
  const envStage = process.env.STAGE || 'local';
  const secretName = `plus_also/foxtel-figma-self-service/${envStage}`;

  const client = new SecretsManagerClient();

  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );

  if (!response.SecretString) {
    throw new Error(
      `AWS Secret ${secretName} not found or cannot be accessed.`,
    );
  }

  const _ssmConfig = parse(response.SecretString, null, {
    allowTrailingComma: true,
    allowEmptyContent: true,
  }) as IAppConfig;

  if (!_ssmConfig) {
    throw new Error(
      `AWS Secret ${secretName} does not contain a valid JSON object`,
    );
  }

  return {
    ..._ssmConfig,
    region,
    stage: envStage as 'local' | 'stage' | 'prod',
  };
};
