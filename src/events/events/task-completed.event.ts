export class TaskCompletedEvent {
  constructor(
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly completedById: string,
    public readonly assignedToId?: string,
    public readonly companyId?: string,
    public readonly teamId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
