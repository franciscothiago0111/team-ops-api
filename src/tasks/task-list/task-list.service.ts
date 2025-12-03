import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

import { TaskListDto } from './dto/task-list.dto';

@Injectable()
export class TaskListService {
  constructor(private readonly prisma: PrismaService) {}

  async getTasksForUser(userId: string, query: TaskListDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      OR: [{ assignedToId: userId }, { createdById: userId }],
      ...(query.status && { status: query.status }),
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      total,
      currentPage: page,
      limit,
    };
  }
}
