import { Injectable, NotFoundException } from '@nestjs/common';

import { Role } from 'src/database/generated/prisma/enums';
import { PrismaService } from 'src/database/prisma.service';

import { TaskListDto } from './dto/task-list.dto';

@Injectable()
export class TaskListService {
  constructor(private readonly prisma: PrismaService) {}

  async getTasksForUser(userId: string, query: TaskListDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user to determine role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Build where clause based on user role
    const where = {};

    if (user.role === Role.ADMIN) {
      Object.assign(where, {
        team: {
          companyId: user.companyId,
        },
      });
    } else if (user.role === Role.MANAGER) {
      // MANAGER: List tasks from teams they manage
      Object.assign(where, {
        team: {
          managerId: userId,
        },
        ...(query.status && { status: query.status }),
      });
    } else {
      // EMPLOYEE: List tasks assigned to them
      Object.assign(where, {
        assignedToId: userId,
        ...(query.status && { status: query.status }),
      });
    }

    if (query.name) {
      Object.assign(where, {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
      });
    }

    if (query.priority) {
      Object.assign(where, {
        priority: query.priority,
      });
    }

    if (query.status) {
      Object.assign(where, {
        status: query.status,
      });
    }

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
