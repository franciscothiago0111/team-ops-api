import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TaskDeleteService {
  constructor(private readonly prisma: PrismaService) {}

  async delete(taskId: string, user: UserPayload) {
    // Find the task
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { team: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this task's company
    if (task.team.companyId !== user.companyId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You can only delete tasks from your company',
      );
    }

    // Delete the task
    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { id: taskId };
  }
}
