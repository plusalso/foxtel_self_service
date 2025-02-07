export interface IAppConfig {
  stage: 'local' | 'stage' | 'prod';
  region: string;
  storage: {
    bucket: string;
    region: string;
  };
  figma: {
    accessToken: string;
  };
}
