export class TaskCreatedEvent {
  constructor(
    public readonly taskId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly status: string,
    public readonly priority: string,
    public readonly createdById: string,
    public readonly companyId?: string,
    public readonly teamId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
