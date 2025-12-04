import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { QueueService } from '../../queue/services/queue.service';
import { EVENT_NAMES } from '../constants/event-names.constant';
import * as TaskEvents from '../interfaces/task-event.interface';

@Injectable()
export class TaskListener {
  private readonly logger = new Logger(TaskListener.name);

  constructor(private readonly queueService: QueueService) {}

  @OnEvent(EVENT_NAMES.TASK_CREATED)
  async handleTaskCreated(payload: TaskEvents.TaskCreatedEvent) {
    this.logger.log(`Task created: ${payload.name} (${payload.taskId})`);

    // Adicionar log à fila
    await this.queueService.addLogJob({
      action: 'TASK_CREATED',
      entity: 'Task',
      entityId: payload.taskId,
      userId: payload.createdById,
      companyId: payload.companyId,
      metadata: {
        name: payload.name,
        teamId: payload.teamId,
      },
    });
  }

  @OnEvent(EVENT_NAMES.TASK_ASSIGNED)
  async handleTaskAssigned(payload: TaskEvents.TaskAssignedEvent) {
    this.logger.log(
      `Task assigned: ${payload.name} to user ${payload.assignedToId}`,
    );

    // Adicionar notificação à fila
    await this.queueService.addNotificationJob({
      userId: payload.assignedToId,
      name: 'Nova Tarefa Atribuída',
      message: `Você foi atribuído à tarefa: ${payload.name}`,
      type: 'INFO',
      entityType: 'Task',
      entityId: payload.taskId,
      metadata: { taskId: payload.taskId, taskname: payload.name },
    });

    // Adicionar log à fila
    await this.queueService.addLogJob({
      action: 'TASK_ASSIGNED',
      entity: 'Task',
      entityId: payload.taskId,
      userId: payload.assignedById,
      companyId: payload.companyId,
      metadata: {
        name: payload.name,
        assignedToId: payload.assignedToId,
      },
    });
  }

  @OnEvent(EVENT_NAMES.TASK_STATUS_UPDATED)
  async handleTaskStatusUpdated(payload: TaskEvents.TaskStatusUpdatedEvent) {
    this.logger.log(
      `Task status updated: ${payload.name} from ${payload.oldStatus} to ${payload.newStatus}`,
    );

    // Adicionar log à fila
    await this.queueService.addLogJob({
      action: 'TASK_STATUS_UPDATED',
      entity: 'Task',
      entityId: payload.taskId,
      userId: payload.updatedById,
      companyId: payload.companyId,
      metadata: {
        name: payload.name,
        oldStatus: payload.oldStatus,
        newStatus: payload.newStatus,
      },
    });
  }

  @OnEvent(EVENT_NAMES.TASK_COMPLETED)
  async handleTaskCompleted(payload: TaskEvents.TaskCompletedEvent) {
    this.logger.log(`Task completed: ${payload.name} (${payload.taskId})`);

    // Adicionar notificação à fila
    await this.queueService.addNotificationJob({
      userId: payload.completedById,
      name: 'Tarefa Concluída',
      message: `Parabéns! Você concluiu a tarefa: ${payload.name}`,
      type: 'SUCCESS',
      entityType: 'Task',
      entityId: payload.taskId,
      metadata: { taskId: payload.taskId, taskname: payload.name },
    });

    // Adicionar log à fila
    await this.queueService.addLogJob({
      action: 'TASK_COMPLETED',
      entity: 'Task',
      entityId: payload.taskId,
      userId: payload.completedById,
      companyId: payload.companyId,
      metadata: {
        name: payload.name,
      },
    });
  }
}
