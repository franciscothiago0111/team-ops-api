import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TaskFindService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(taskId: string, user: UserPayload) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
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
            companyId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check access: user must be creator, assigned user, or in same company
    const isCreator = task.createdById === user.id;
    const isAssigned = task.assignedToId === user.id;
    const isSameCompany = task.team.companyId === user.companyId;

    if (!isCreator && !isAssigned && !isSameCompany) {
      throw new ForbiddenException(
        'You do not have permission to view this task',
      );
    }

    return task;
  }
}
