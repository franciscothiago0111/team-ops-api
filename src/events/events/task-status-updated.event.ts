export class TaskStatusUpdatedEvent {
  constructor(
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly updatedById: string,
    public readonly assignedToId?: string,
    public readonly companyId?: string,
    public readonly teamId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
