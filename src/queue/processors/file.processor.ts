import * as Bull from 'bull';

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../integrations/storage/storage.service';
import { QUEUE_NAMES } from '../constants/queue-names.constant';
import * as JobInterfaces from '../interfaces/job.interface';

@Processor(QUEUE_NAMES.FILE)
export class FileProcessor {
  private readonly logger = new Logger(FileProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  @Process()
  async handleFileJob(job: Bull.Job<JobInterfaces.FileProcessJob>) {
    this.logger.log(`Processing file job ${job.id}`);
    const { action } = job.data as { action: string };

    try {
      switch (action) {
        case 'upload':
          await this.handleFileUpload(job.data);
          break;
        case 'delete':
          await this.handleFileDelete(job.data);
          break;
        default:
          this.logger.warn(`Unknown file action: ${action}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process file job: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleFileUpload(data: JobInterfaces.FileProcessJob) {
    const { fileId, taskId, file } = data;

    this.logger.log(`Processing file upload for fileId: ${fileId}`);

    try {
      // Reconstruct Buffer from serialized data
      const buffer = Buffer.isBuffer(file!.buffer)
        ? file!.buffer
        : Buffer.from(file!.buffer);

      // Upload to storage
      const uploadResult = await this.storageService.uploadFile({
        file: buffer,
        filename: file!.originalname,
        contentType: file!.mimetype,
        folder: `tasks/${taskId}`,
        metadata: {
          taskId,
          fileId,
          originalName: file!.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file');
      }

      // Update file record with storage info
      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          filepath: uploadResult.key!,
          status: 'COMPLETED',
          url: uploadResult.url,
        },
      });

      this.logger.log(`File upload completed for fileId: ${fileId}`);
    } catch (error) {
      this.logger.error(
        `File upload failed for fileId: ${fileId}`,
        error.stack,
      );

      // Update file record with error status
      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });

      throw error;
    }
  }

  private async handleFileDelete(data: JobInterfaces.FileProcessJob) {
    const { fileId, filepath } = data;

    this.logger.log(
      `Processing file deletion for fileId: ${fileId}, filepath: ${filepath}`,
    );

    try {
      // Validate filepath exists
      if (!filepath || filepath.trim() === '') {
        throw new Error(
          `Cannot delete file: filepath is empty for fileId: ${fileId}`,
        );
      }

      // Delete from storage
      const deleteResult = await this.storageService.deleteFile({
        key: filepath,
      });

      if (!deleteResult.success) {
        throw new Error(deleteResult.error || 'Failed to delete file');
      }

      // Delete file record from database
      await this.prisma.file.delete({
        where: { id: fileId },
      });

      this.logger.log(`File deletion completed for fileId: ${fileId}`);
    } catch (error) {
      const errorMessage = error.message || 'Unknown error';
      const isAccessDenied = errorMessage.includes('Access Denied');

      this.logger.error(
        `File deletion failed for fileId: ${fileId}, filepath: ${filepath}${isAccessDenied ? ' - PERMISSION ISSUE' : ''}`,
        error.stack,
      );

      // Mark file as failed deletion
      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          status: 'DELETE_FAILED',
          error: isAccessDenied
            ? 'Access Denied: R2 API token lacks delete permissions'
            : errorMessage,
        },
      });

      throw error;
    }
  }
}
