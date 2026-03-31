import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('click')
  postClick() {
    return this.appService.addClick();
  }

  @Get('clicks')
  getClicks() {
    return this.appService.getClickCount();
  }
}
