export interface UserCreatedEvent {
  userId: string;
  email: string;
  name: string;
  role: string;
  companyId?: string;
  timestamp: Date;
}

export interface EmployeeAddedEvent {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  teamId: string;
  teamName: string;
  companyId: string;
  addedById: string;
  timestamp: Date;
}
