import { Controller, Get, Query } from '@nestjs/common';
import { TestService } from './test.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('test-none-production')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('/dns/')
  async resolveDns(@Query('domain') domain: string) {
    return this.testService.resolveDns(domain);
  }
}
