import { Module } from '@nestjs/common';

import { TaskFileUploadController } from './task-file-upload.controller';
import { TaskFileUploadService } from './task-file-upload.service';

@Module({
  controllers: [TaskFileUploadController],
  providers: [TaskFileUploadService],
})
export class TaskFileUploadModule {}
