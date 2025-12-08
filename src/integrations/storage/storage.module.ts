import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CloudflareR2Adapter } from './adapters/cloudflare-r2.adapter';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    CloudflareR2Adapter,
    {
      provide: 'STORAGE_ADAPTER',
      useFactory: (configService: ConfigService) => {
        const storageProvider =
          configService.get<string>('STORAGE_PROVIDER') || 'cloudflare-r2';

        // Return the appropriate adapter based on configuration
        if (storageProvider === 'cloudflare-r2') {
          return new CloudflareR2Adapter(configService);
        }
        // Default to Cloudflare R2
        return new CloudflareR2Adapter(configService);
      },
      inject: [ConfigService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
