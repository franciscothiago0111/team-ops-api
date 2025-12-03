import { Inject, Injectable } from '@nestjs/common';

import type { IEmailAdapter } from './interfaces/email-adapter.interface';
import {
  SendEmailDto,
  EmailResponse,
} from './interfaces/email-adapter.interface';

@Injectable()
export class EmailService {
  constructor(
    @Inject('EMAIL_ADAPTER')
    private readonly emailAdapter: IEmailAdapter,
  ) {}

  async sendEmail(data: SendEmailDto): Promise<EmailResponse> {
    return this.emailAdapter.sendEmail(data);
  }

  async sendBulkEmails(emails: SendEmailDto[]): Promise<EmailResponse[]> {
    return this.emailAdapter.sendBulkEmails(emails);
  }

  async verifyConnection(): Promise<boolean> {
    return this.emailAdapter.verifyConnection();
  }

  // High-level business methods
  async sendWelcomeEmail(to: string, name: string): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      subject: 'Welcome to Team Ops!',
      body: `Hello ${name}, welcome to our platform!`,
      html: `<h1>Hello ${name}</h1><p>Welcome to our platform!</p>`,
    });
  }

  async sendTaskAssignmentEmail(
    to: string,
    taskTitle: string,
    assignedBy: string,
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      subject: `New Task Assigned: ${taskTitle}`,
      body: `You have been assigned a new task: ${taskTitle} by ${assignedBy}`,
      html: `<h2>New Task Assignment</h2><p><strong>${taskTitle}</strong></p><p>Assigned by: ${assignedBy}</p>`,
    });
  }
}
