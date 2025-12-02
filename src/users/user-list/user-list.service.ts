import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UserListService {
  constructor(private readonly prismaService: PrismaService) {}

  async list() {
    return await this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }
}
