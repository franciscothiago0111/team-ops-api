import { Module } from '@nestjs/common';
import { TaskFileListService } from './task-file-list.service';
import { TaskFileListController } from './task-file-list.controller';

@Module({
  controllers: [TaskFileListController],
  providers: [TaskFileListService],
})
export class TaskFileListModule {}
