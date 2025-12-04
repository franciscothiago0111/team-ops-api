import * as Bull from 'bull';

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

import { NotificationsGateway } from '../../websocket/gateways/notifications.gateway';
import { QUEUE_NAMES } from '../constants/queue-names.constant';
import * as JobInterfaces from '../interfaces/job.interface';

@Processor(QUEUE_NAMES.NOTIFICATION)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly prismaService: PrismaService,
  ) {}

  @Process()
  async handleNotificationJob(
    job: Bull.Job<JobInterfaces.SendNotificationJob>,
  ) {
    this.logger.log(`Processing notification job ${job.id}`);
    const { userId, name, message, type, entityType, entityId } = job.data;

    try {
      const notification = await this.prismaService.notification.create({
        data: {
          userId: userId,
          title: name,
          message: message,
          type: type || 'INFO',
          entityType: entityType,
          entityId: entityId,
        },
      });

      this.logger.log(`Notification saved to database: ${notification.id}`);

      console.log('notification', notification);

      // Send notification via WebSocket
      this.notificationsGateway.sendToUser(userId, {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
      });

      this.logger.log(`Notification sent to user ${userId}: ${name} (${type})`);

      return { success: true, userId, name, notificationId: notification.id };
    } catch (error) {
      this.logger.error(`Failed to process notification for ${userId}:`, error);
      throw error;
    }
  }
}
