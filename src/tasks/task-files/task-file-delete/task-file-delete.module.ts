import { Module } from '@nestjs/common';

import { TaskFileDeleteController } from './task-file-delete.controller';
import { TaskFileDeleteService } from './task-file-delete.service';

@Module({
  controllers: [TaskFileDeleteController],
  providers: [TaskFileDeleteService],
})
export class TaskFileDeleteModule {}
