import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { QueueService } from '../../queue/services/queue.service';
import { EVENT_NAMES } from '../constants/event-names.constant';
import * as FileEvents from '../interfaces/file-event.interface';

@Injectable()
export class FileListener {
  private readonly logger = new Logger(FileListener.name);

  constructor(private readonly queueService: QueueService) {}

  @OnEvent(EVENT_NAMES.FILE_UPLOAD)
  async handleFileUpload(payload: FileEvents.FileUploadEvent) {
    this.logger.log(`File upload queued: ${payload.file.originalname}`);

    await this.queueService.addFileJob({
      action: 'upload',
      fileId: payload.fileId,
      taskId: payload.taskId,
      file: payload.file,
    });
  }

  @OnEvent(EVENT_NAMES.FILE_DELETE)
  async handleFileDelete(payload: FileEvents.FileDeleteEvent) {
    this.logger.log(`File deletion queued: ${payload.fileId}`);

    await this.queueService.addFileJob({
      action: 'delete',
      fileId: payload.fileId,
      taskId: payload.taskId,
      filepath: payload.filepath,
    });
  }
}
