import { Injectable, Logger } from '@nestjs/common';

import {
  IEmailAdapter,
  SendEmailDto,
  EmailResponse,
} from '../interfaces/email-adapter.interface';

@Injectable()
export class SendGridAdapter implements IEmailAdapter {
  private readonly logger = new Logger(SendGridAdapter.name);

  sendEmail(data: SendEmailDto): Promise<EmailResponse> {
    try {
      this.logger.log(
        `Sending email via SendGrid to: ${Array.isArray(data.to) ? data.to.join(', ') : data.to}`,
      );

      // TODO: Implement actual SendGrid logic
      // const msg = {
      //   to: data.to,
      //   from: data.from || process.env.SENDGRID_FROM,
      //   subject: data.subject,
      //   text: data.body,
      //   html: data.html,
      // };
      // const response = await sgMail.send(msg);

      return Promise.resolve({
        success: true,
        messageId: `sendgrid-${Date.now()}`,
      });
    } catch (error) {
      this.logger.error(`Failed to send email via SendGrid: ${error.message}`);
      return Promise.resolve({
        success: false,
        error: error.message,
      });
    }
  }

  sendBulkEmails(emails: SendEmailDto[]): Promise<EmailResponse[]> {
    return Promise.all(emails.map((email) => this.sendEmail(email)));
  }

  verifyConnection(): Promise<boolean> {
    try {
      // TODO: Implement SendGrid connection verification
      return Promise.resolve(true);
    } catch (error) {
      this.logger.error(`SendGrid connection failed: ${error.message}`);
      return Promise.resolve(false);
    }
  }
}
