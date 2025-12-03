export class EmployeeAddedEvent {
  constructor(
    public readonly employeeId: string,
    public readonly employeeName: string,
    public readonly employeeEmail: string,
    public readonly teamId: string,
    public readonly teamName: string,
    public readonly addedById: string,
    public readonly companyId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
