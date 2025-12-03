import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

import { NotificationListDto } from './dto/notification-list-dto';

@Injectable()
export class NotificationListService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotificationsForUser(userId: string, query: NotificationListDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      userId,
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      total,
      currentPage: page,
      limit,
    };
  }
}
