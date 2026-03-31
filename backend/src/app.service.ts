import { Injectable } from '@nestjs/common';
import type { Click } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async addClick(): Promise<Click> {
    return await this.prisma.click.create({ data: {} });
  }

  async getClickCount(): Promise<number> {
    return await this.prisma.click.count();
  }
}
