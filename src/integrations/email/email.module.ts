import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { NodemailerAdapter } from './adapters/nodemailer.adapter';
import { SendGridAdapter } from './adapters/sendgrid.adapter';
import { EmailTemplateService } from './email-template.service';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule],
  providers: [
    NodemailerAdapter,
    SendGridAdapter,
    {
      provide: 'EMAIL_ADAPTER',
      useFactory: (configService: ConfigService) => {
        const emailProvider =
          configService.get<string>('EMAIL_PROVIDER') || 'nodemailer';

        // Return the appropriate adapter based on configuration
        if (emailProvider === 'sendgrid') {
          return new SendGridAdapter();
        }
        return new NodemailerAdapter();
      },
      inject: [ConfigService],
    },
    EmailService,
    EmailTemplateService,
  ],
  exports: [EmailService, EmailTemplateService],
})
export class EmailModule {}
