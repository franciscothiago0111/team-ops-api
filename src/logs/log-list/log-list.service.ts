import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

import { LogListDto } from './dto/log-list.dto';

@Injectable()
export class LogListService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, logListDto: LogListDto) {
    // Get user to determine role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const page = Number(logListDto.page) || 1;
    const limit = Number(logListDto.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    Object.assign(where, {
      companyId: user.companyId,
    });

    if (logListDto.entity) {
      Object.assign(where, {
        entity: {
          contains: logListDto.entity,
          mode: 'insensitive',
        },
      });
    }

    const [data, total] = await Promise.all([
      this.prisma.log.findMany({
        where,
        select: {
          id: true,
          entity: true,
          userId: true,
          metadata: true,
          action: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.log.count({ where }),
    ]);

    return {
      data,
      total,
      currentPage: page,
      limit,
    };
  }
}
