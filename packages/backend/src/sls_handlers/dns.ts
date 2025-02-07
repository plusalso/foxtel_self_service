import { Handler } from 'aws-lambda';
import dns from 'dns';

export const handler: Handler = async (event: any) => {
  event = JSON.parse(event.body);
  const domain = event.domain;

  return new Promise((resolve, reject) => {
    dns.resolve(domain, (err, addresses) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          statusCode: 200,
          body: JSON.stringify(addresses.join(', ')),
        });
      }
    });
  });
};
