import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getMetadata(): any {
    return {
      timestamp: new Date().getTime(),
    };
  }
}
