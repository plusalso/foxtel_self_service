import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { bootstrapApp } from '../bootstrap';

let server: Handler;

async function getServerlessHandler(): Promise<Handler> {
  const app = await bootstrapApp();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  console.log('main handler');
  server = server ?? (await getServerlessHandler());
  return server(event, context, callback);
};
