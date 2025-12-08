import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../../../database/prisma.service';
import { EVENT_NAMES } from '../../../events/constants/event-names.constant';

@Injectable()
export class TaskFileDeleteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async run(taskId: string, fileId: string) {
    // Verify task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Verify file exists and belongs to the task
    const fileRecord = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord || fileRecord.taskId !== taskId) {
      throw new NotFoundException(
        `File with ID ${fileId} not found for Task ID ${taskId}`,
      );
    }

    // Update file status to DELETING
    await this.prisma.file.update({
      where: { id: fileId },
      data: {
        status: 'DELETING',
      },
    });

    // Emit event to process file deletion asynchronously
    this.eventEmitter.emit(EVENT_NAMES.FILE_DELETE, {
      fileId: fileRecord.id,
      filepath: fileRecord.filepath,
      taskId,
    });

    return {
      id: fileRecord.id,
      filename: fileRecord.filename,
      status: 'DELETING',
      message: 'File deletion queued for processing',
    };
  }
}
