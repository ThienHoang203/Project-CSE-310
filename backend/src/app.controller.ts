import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { Public } from './decorator/public-route.decorator';
import { log } from 'console';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  getHello(@Req() req: Request): string {
    log(req.cookies);
    return this.appService.getHello();
  }
}
