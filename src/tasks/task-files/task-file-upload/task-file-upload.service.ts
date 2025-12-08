import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../../../database/prisma.service';
import { EVENT_NAMES } from '../../../events/constants/event-names.constant';

@Injectable()
export class TaskFileUploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async run(taskId: string, files: Express.Multer.File[]) {
    // Verify task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const fileRecords: Array<{
      id: string;
      filename: string;
      status: string | null;
      createdAt: Date;
    }> = [];

    // Create file records with PENDING status
    for (const file of files) {
      const fileRecord = await this.prisma.file.create({
        data: {
          filename: file.originalname,
          filepath: '',
          mimetype: file.mimetype,
          size: file.size,
          taskId,
          status: 'PENDING',
        },
      });

      fileRecords.push(fileRecord);

      // Emit event to process file upload asynchronously
      this.eventEmitter.emit(EVENT_NAMES.FILE_UPLOAD, {
        fileId: fileRecord.id,
        taskId,
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
      });
    }

    return fileRecords.map((record) => ({
      id: record.id,
      filename: record.filename,
      status: record.status,
      message: 'File upload queued for processing',
      createdAt: record.createdAt,
    }));
  }
}
