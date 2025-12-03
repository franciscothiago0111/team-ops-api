import { Module } from '@nestjs/common';

import { TaskDeleteController } from './task-delete.controller';
import { TaskDeleteService } from './task-delete.service';

@Module({
  controllers: [TaskDeleteController],
  providers: [TaskDeleteService],
})
export class TaskDeleteModule {}
