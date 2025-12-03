export class TeamCreatedEvent {
  constructor(
    public readonly teamId: string,
    public readonly teamName: string,
    public readonly companyId: string,
    public readonly createdById: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
