import { Module } from '@nestjs/common';

import { TaskFindController } from './task-find.controller';
import { TaskFindService } from './task-find.service';

@Module({
  controllers: [TaskFindController],
  providers: [TaskFindService],
})
export class TaskFindModule {}
