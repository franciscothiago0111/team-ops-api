import { Module } from '@nestjs/common';

import { TaskFileDeleteModule } from './task-file-delete/task-file-delete.module';
import { TaskFileListModule } from './task-file-list/task-file-list.module';
import { TaskFileUploadModule } from './task-file-upload/task-file-upload.module';

@Module({
  imports: [TaskFileUploadModule, TaskFileListModule, TaskFileDeleteModule],
})
export class TaskFilesModule {}
