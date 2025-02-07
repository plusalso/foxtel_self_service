import { Injectable } from '@nestjs/common';
import dns from 'dns';

@Injectable()
export class TestService {
  resolveDns(domain: string): Promise<string> {
    return new Promise((resolve, reject) => {
      dns.resolve(domain, (err, addresses) => {
        if (err) {
          reject(err);
        } else {
          resolve(addresses.join(', '));
        }
      });
    });
  }
}
