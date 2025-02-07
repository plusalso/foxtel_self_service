import crypto from 'crypto';

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const sha256hash = (str: string) =>
  crypto.createHash('sha256').update(str).digest('hex');
