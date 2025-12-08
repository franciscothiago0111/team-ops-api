import { Controller, Delete, Param } from '@nestjs/common';

import { ResponseService } from 'src/common/services';

import { TaskFileDeleteService } from './task-file-delete.service';

@Controller('tasks')
export class TaskFileDeleteController {
  constructor(
    private readonly taskFileDeleteService: TaskFileDeleteService,
    private readonly response: ResponseService,
  ) {}

  @Delete('/:taskId/files/:fileId')
  async deleteTaskFile(
    @Param('taskId') taskId: string,
    @Param('fileId') fileId: string,
  ) {
    const response = await this.taskFileDeleteService.run(taskId, fileId);
    return this.response.success({
      message: 'File deleted successfully',
      data: response,
    });
  }
}
