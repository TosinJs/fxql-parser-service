import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  @ApiOkResponse({ description: 'Application is up and running' })
  getHealth(): string {
    return this.appService.getHealth();
  }
}
