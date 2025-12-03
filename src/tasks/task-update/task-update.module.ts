import { Module } from '@nestjs/common';

import { TaskUpdateController } from './task-update.controller';
import { TaskUpdateService } from './task-update.service';

@Module({
  controllers: [TaskUpdateController],
  providers: [TaskUpdateService],
})
export class TaskUpdateModule {}
