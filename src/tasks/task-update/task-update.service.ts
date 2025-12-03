import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { TaskStatus } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';

import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
    user: UserPayload,
  ) {
    // Find the task
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        team: true,
        createdBy: true,
        assignedTo: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check permissions: must be creator or assigned user
    const isCreator = task.createdById === user.id;
    const isAssigned = task.assignedToId === user.id;

    if (!isCreator && !isAssigned) {
      throw new ForbiddenException(
        'You do not have permission to update this task',
      );
    }

    // Validate status flow if status is being changed
    if (updateTaskDto.status && updateTaskDto.status !== task.status) {
      this.validateStatusTransition(task.status, updateTaskDto.status);
    }

    // Handle assignment change
    const assignedToId = updateTaskDto.assignedToId;
    let shouldResetStatus = false;

    if (assignedToId !== undefined && assignedToId !== task.assignedToId) {
      if (assignedToId) {
        // Validate assigned user
        const assignedUser = await this.prisma.user.findUnique({
          where: { id: assignedToId },
        });

        if (!assignedUser) {
          throw new NotFoundException('Assigned user not found');
        }

        // Check if assigned user is in the same team
        if (assignedUser.teamId !== task.teamId) {
          throw new ForbiddenException(
            'Task can only be assigned to users in the same team',
          );
        }

        // Check if assigned user is in the same company
        if (assignedUser.companyId !== task.team.companyId) {
          throw new ForbiddenException(
            'Task cannot be assigned to users from another company',
          );
        }
      }

      // Reset status to PENDING when reassigning (optional rule)
      shouldResetStatus = true;
    }

    // Update the task
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(updateTaskDto.name && { name: updateTaskDto.name }),
        ...(updateTaskDto.description !== undefined && {
          description: updateTaskDto.description,
        }),
        ...(updateTaskDto.status && { status: updateTaskDto.status }),
        ...(updateTaskDto.priority && { priority: updateTaskDto.priority }),
        ...(updateTaskDto.dueDate !== undefined && {
          dueDate: updateTaskDto.dueDate
            ? new Date(updateTaskDto.dueDate)
            : null,
        }),
        ...(updateTaskDto.labels !== undefined && {
          labels: updateTaskDto.labels,
        }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(shouldResetStatus &&
          !updateTaskDto.status && { status: TaskStatus.PENDING }),
      },
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
    });

    return updatedTask;
  }

  private validateStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): void {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      PENDING: [TaskStatus.IN_PROGRESS],
      IN_PROGRESS: [TaskStatus.COMPLETED],
      COMPLETED: [], // No transitions allowed from COMPLETED
      CANCELLED: [], // No transitions allowed from CANCELLED
    };

    const allowedTransitions = validTransitions[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
