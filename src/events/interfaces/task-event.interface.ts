export interface TaskCreatedEvent {
  taskId: string;
  title: string;
  createdById: string;
  teamId: string;
  companyId: string;
  timestamp: Date;
}

export interface TaskAssignedEvent {
  taskId: string;
  title: string;
  assignedToId: string;
  assignedById: string;
  teamId: string;
  companyId: string;
  timestamp: Date;
}

export interface TaskStatusUpdatedEvent {
  taskId: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  updatedById: string;
  teamId: string;
  companyId: string;
  timestamp: Date;
}

export interface TaskCompletedEvent {
  taskId: string;
  title: string;
  completedById: string;
  teamId: string;
  companyId: string;
  timestamp: Date;
}
