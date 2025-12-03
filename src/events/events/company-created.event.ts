export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: string,
    public readonly companyId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
