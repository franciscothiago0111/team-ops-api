import { Module } from '@nestjs/common';

import { TaskCreateModule } from './task-create/task-create.module';
import { TaskDeleteModule } from './task-delete/task-delete.module';
import { TaskFilesModule } from './task-files/task-files.module';
import { TaskFindModule } from './task-find/task-find.module';
import { TaskListModule } from './task-list/task-list.module';
import { TaskUpdateModule } from './task-update/task-update.module';

@Module({
  imports: [
    TaskCreateModule,
    TaskListModule,
    TaskFindModule,
    TaskUpdateModule,
    TaskDeleteModule,
    TaskFilesModule,
  ],
})
export class TasksModule {}
