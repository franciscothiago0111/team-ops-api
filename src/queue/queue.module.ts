import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailModule } from '../integrations/email/email.module';
import { StorageModule } from '../integrations/storage/storage.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { QUEUE_NAMES } from './constants/queue-names.constant';
import { EmailProcessor } from './processors/email.processor';
import { FileProcessor } from './processors/file.processor';
import { LogProcessor } from './processors/log.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { TaskProcessor } from './processors/task.processor';
import { QueueService } from './services/queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 1000, // Keep last 1000 failed jobs
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.NOTIFICATION },
      { name: QUEUE_NAMES.TASK },
      { name: QUEUE_NAMES.LOG },
      { name: QUEUE_NAMES.FILE },
    ),
    EmailModule,
    StorageModule,
    WebsocketModule,
  ],
  providers: [
    QueueService,
    EmailProcessor,
    NotificationProcessor,
    TaskProcessor,
    LogProcessor,
    FileProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
