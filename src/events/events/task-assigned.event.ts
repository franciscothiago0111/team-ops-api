export class TaskAssignedEvent {
  constructor(
    public readonly taskId: string,
    public readonly title: string,
    public readonly assignedToId: string,
    public readonly assignedToName: string,
    public readonly assignedById: string,
    public readonly dueDate?: Date,
    public readonly companyId?: string,
    public readonly teamId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
