import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @Body('folder') folder?: string) {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.storageService.uploadFile({
      file: file.buffer,
      filename: file.originalname,
      contentType: file.mimetype,
      folder,
    });

    if (!result.success) {
      throw new HttpException(
        result.error || 'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result;
  }

  @Get('files')
  async listFiles(
    @Body('prefix') prefix?: string,
    @Body('maxKeys') maxKeys?: number,
  ) {
    const result = await this.storageService.listFiles({
      prefix,
      maxKeys,
    });

    if (!result.success) {
      throw new HttpException(
        result.error || 'Failed to list files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result;
  }

  @Get(':key/signed-url')
  async getSignedUrl(
    @Param('key') key: string,
    @Body('expiresIn') expiresIn?: number,
  ) {
    try {
      const url = await this.storageService.getSignedUrl(key, expiresIn);
      return { url };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate signed URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    const result = await this.storageService.deleteFile({ key });

    if (!result.success) {
      throw new HttpException(
        result.error || 'Failed to delete file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result;
  }
}
