export const EVENT_NAMES = {
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_STATUS_UPDATED: 'task.status.updated',
  TASK_COMPLETED: 'task.completed',
  EMPLOYEE_ADDED: 'employee.added',
  TEAM_CREATED: 'team.created',
  USER_CREATED: 'user.created',
  COMPANY_CREATED: 'company.created',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
