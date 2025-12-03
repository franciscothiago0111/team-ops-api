import { Injectable, Logger } from '@nestjs/common';

import {
  IEmailAdapter,
  SendEmailDto,
  EmailResponse,
} from '../interfaces/email-adapter.interface';

@Injectable()
export class NodemailerAdapter implements IEmailAdapter {
  private readonly logger = new Logger(NodemailerAdapter.name);

  sendEmail(data: SendEmailDto): Promise<EmailResponse> {
    try {
      const recipients = Array.isArray(data.to) ? data.to.join(', ') : data.to;
      this.logger.log(`Sending email to ${recipients}`);

      // TODO: Implement actual nodemailer logic
      // const transporter = nodemailer.createTransport({...});
      // const info = await transporter.sendMail({
      //   from: data.from || process.env.EMAIL_FROM,
      //   to: Array.isArray(data.to) ? data.to.join(',') : data.to,
      //   subject: data.subject,
      //   text: data.body,
      //   html: data.html,
      //   cc: data.cc,
      //   bcc: data.bcc,
      //   attachments: data.attachments,
      // });

      return Promise.resolve({
        success: true,
        messageId: `mock-${Date.now()}`,
      });
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
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
      // TODO: Implement connection verification
      // await transporter.verify();
      return Promise.resolve(true);
    } catch (error) {
      this.logger.error(`Email connection failed: ${error.message}`);
      return Promise.resolve(false);
    }
  }
}
