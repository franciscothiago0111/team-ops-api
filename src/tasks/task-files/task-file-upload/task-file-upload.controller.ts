import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';

import { ApiFile } from 'src/common/decorators';
import { ResponseService } from 'src/common/services';

import { TaskFileUploadService } from './task-file-upload.service';

@Controller('tasks')
export class TaskFileUploadController {
  constructor(
    private readonly taskFileUploadService: TaskFileUploadService,
    private readonly response: ResponseService,
  ) {}

  @Post('/:id/upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiFile('files')
  async uploadTaskFile(
    @Param('id') taskId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('Uploaded files:', files);

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    const result = await this.taskFileUploadService.run(taskId, files);

    return this.response.success({
      message: 'File uploaded successfully',
      data: result,
    });
  }
}
