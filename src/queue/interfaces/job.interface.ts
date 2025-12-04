export interface SendEmailJob {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface SendNotificationJob {
  userId: string;
  name: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export interface TaskProcessJob {
  taskId: string;
  action: 'assign' | 'update' | 'complete' | 'delete';
  data: Record<string, any>;
}

export interface CreateLogJob {
  action: string;
  entity: string;
  entityId: string;
  userId?: string;
  companyId: string;
  metadata?: Record<string, any>;
}
