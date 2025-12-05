import sgMail from '@sendgrid/mail';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  IEmailAdapter,
  SendEmailDto,
  EmailResponse,
} from '../interfaces/email-adapter.interface';

@Injectable()
export class SendGridAdapter implements IEmailAdapter {
  private readonly logger = new Logger(SendGridAdapter.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'SENDGRID_API_KEY not found in environment variables. SendGrid adapter will not work properly.',
      );
    } else {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid adapter initialized successfully');
    }
  }

  async sendEmail(data: SendEmailDto): Promise<EmailResponse> {
    try {
      const recipients = Array.isArray(data.to) ? data.to.join(', ') : data.to;
      this.logger.log(`Sending email via SendGrid to: ${recipients}`);

      const msg = {
        to: data.to,
        from:
          data.from ||
          this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
          'noreply@teamops.com',
        subject: data.subject,
        text: data.body,
        html: data.html || data.body,
        cc: data.cc,
        bcc: data.bcc,
        attachments: data.attachments?.map((att) => ({
          content: att.content.toString('base64'),
          filename: att.filename,
          type: att.contentType,
          disposition: 'attachment',
        })),
      };

      const [response] = await sgMail.send(msg);

      this.logger.log(
        `Email sent successfully via SendGrid. Status: ${response.statusCode}`,
      );

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email via SendGrid: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulkEmails(emails: SendEmailDto[]): Promise<EmailResponse[]> {
    try {
      this.logger.log(`Sending ${emails.length} emails via SendGrid bulk API`);

      const messages = emails.map((data) => ({
        to: data.to,
        from:
          data.from ||
          this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
          'noreply@teamops.com',
        subject: data.subject,
        text: data.body,
        html: data.html || data.body,
        cc: data.cc,
        bcc: data.bcc,
      }));

      const [response] = await sgMail.send(messages);

      this.logger.log(
        `Bulk emails sent successfully. Status: ${response.statusCode}`,
      );

      return messages.map((_, index) => ({
        success: true,
        messageId: `bulk-${Date.now()}-${index}`,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to send bulk emails via SendGrid: ${error.message}`,
      );
      return emails.map(() => ({
        success: false,
        error: error.message,
      }));
    }
  }

  verifyConnection(): Promise<boolean> {
    try {
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (!apiKey) {
        this.logger.warn('SendGrid API key not configured');
        return Promise.resolve(false);
      }

      // SendGrid doesn't have a direct verification endpoint,
      // so we check if the API key is set
      this.logger.log('SendGrid connection verified (API key is set)');
      return Promise.resolve(true);
    } catch (error) {
      this.logger.error(`SendGrid connection failed: ${error.message}`);
      return Promise.resolve(false);
    }
  }
}
