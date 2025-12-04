import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';
import {
  EventDispatcherService,
  EVENT_NAMES,
  TaskCreatedEvent,
  TaskAssignedEvent,
} from 'src/events';

import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskCreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: UserPayload) {
    // Validate team exists and belongs to user's company
    const team = await this.prisma.team.findUnique({
      where: { id: createTaskDto.teamId },
      include: { company: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (user.role === 'MANAGER' && team.managerId !== user.id) {
      throw new ForbiddenException(
        'You must belong to the team to create tasks',
      );
    }

    // Check if team belongs to same company
    if (user.companyId && team.companyId !== user.companyId) {
      throw new ForbiddenException('Team must belong to your company');
    }

    // Handle task assignment
    const assignedToId = createTaskDto.assignedToId;

    // Validate assigned user if provided
    if (assignedToId) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: assignedToId },
      });

      if (!assignedUser) {
        throw new NotFoundException('Assigned user not found');
      }

      // Check if assigned user is in the same team
      if (assignedUser.teamId !== team.id) {
        throw new ForbiddenException(
          'Task can only be assigned to users in the same team',
        );
      }

      // Check if assigned user is in the same company
      if (assignedUser.companyId !== team.companyId) {
        throw new ForbiddenException(
          'Task cannot be assigned to users from another company',
        );
      }
    }

    // Create the task
    const task = await this.prisma.task.create({
      data: {
        name: createTaskDto.name,
        description: createTaskDto.description,
        status: createTaskDto.status || 'PENDING',
        priority: createTaskDto.priority || 'MEDIUM',
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,

        assignedToId,
        createdById: user.id,
        teamId: team.id,
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

    // Emit TASK_CREATED event
    this.eventDispatcher.dispatch(
      EVENT_NAMES.TASK_CREATED,
      new TaskCreatedEvent(
        task.id,
        task.name,
        task.description || '',
        task.status,
        task.priority,
        user.id,
        team.companyId,
        team.id,
      ),
    );

    // Emit TASK_ASSIGNED event if task was assigned
    if (task.assignedTo) {
      this.eventDispatcher.dispatch(
        EVENT_NAMES.TASK_ASSIGNED,
        new TaskAssignedEvent(
          task.id,
          task.name,
          task.assignedTo.id,
          task.assignedTo.name || '',
          user.id,
          task.dueDate || undefined,
          team.companyId,
          team.id,
        ),
      );
    }

    return task;
  }
}
