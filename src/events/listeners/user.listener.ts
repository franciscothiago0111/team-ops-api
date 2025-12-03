import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { QueueService } from '../../queue/services/queue.service';
import { EVENT_NAMES } from '../constants/event-names.constant';
import * as UserEvents from '../interfaces/user-event.interface';

@Injectable()
export class UserListener {
  private readonly logger = new Logger(UserListener.name);

  constructor(private readonly queueService: QueueService) {}

  @OnEvent(EVENT_NAMES.USER_CREATED)
  async handleUserCreated(payload: UserEvents.UserCreatedEvent) {
    this.logger.log(`User created: ${payload.name} (${payload.email})`);

    // Send welcome email
    await this.queueService.addEmailJob({
      to: payload.email,
      subject: 'Welcome to TeamOps!',
      template: 'user-welcome',
      context: {
        userName: payload.name,
        userEmail: payload.email,
        companyName: payload.companyId ? undefined : 'TeamOps',
      },
    });

    // Create log entry
    if (payload.companyId) {
      await this.queueService.addLogJob({
        action: 'USER_CREATED',
        entity: 'User',
        entityId: payload.userId,
        companyId: payload.companyId,
        metadata: {
          email: payload.email,
          name: payload.name,
          role: payload.role,
        },
      });
    }
  }

  @OnEvent(EVENT_NAMES.EMPLOYEE_ADDED)
  async handleEmployeeAdded(payload: UserEvents.EmployeeAddedEvent) {
    this.logger.log(
      `Employee added to team: ${payload.employeeName} to ${payload.teamName}`,
    );

    // Notify the employee
    await this.queueService.addNotificationJob({
      userId: payload.employeeId,
      title: 'Added to Team',
      message: `You have been added to team: ${payload.teamName}`,
      type: 'INFO',
      entityType: 'Team',
      entityId: payload.teamId,
      metadata: {
        teamId: payload.teamId,
        teamName: payload.teamName,
      },
    });

    // Send email notification
    await this.queueService.addEmailJob({
      to: payload.employeeEmail,
      subject: `You've been added to ${payload.teamName}`,
      template: 'team-added',
      context: {
        employeeName: payload.employeeName,
        teamName: payload.teamName,
      },
    });

    // Create log entry
    await this.queueService.addLogJob({
      action: 'EMPLOYEE_ADDED_TO_TEAM',
      entity: 'User',
      entityId: payload.employeeId,
      userId: payload.addedById,
      companyId: payload.companyId,
      metadata: {
        employeeName: payload.employeeName,
        teamId: payload.teamId,
        teamName: payload.teamName,
      },
    });
  }
}
