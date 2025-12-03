import { Module } from '@nestjs/common';

import { TaskListController } from './task-list.controller';
import { TaskListService } from './task-list.service';

@Module({
  controllers: [TaskListController],
  providers: [TaskListService],
})
export class TaskListModule {}
