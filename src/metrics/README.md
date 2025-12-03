# Metrics System - Role-Based Analytics

## Overview
This module provides comprehensive metrics and analytics based on user roles (ADMIN, MANAGER, EMPLOYEE). Each role receives tailored insights relevant to their responsibilities and scope.

## Endpoint
```
GET /metrics
```

## Authentication
Requires Bearer token authentication. Metrics are automatically scoped to the authenticated user's role.

## Query Parameters (Filters)

All parameters are optional:

- `startDate` (ISO 8601 date string): Start of the period for metrics calculation (default: 30 days ago)
- `endDate` (ISO 8601 date string): End of the period for metrics calculation (default: today)
- `teamId` (UUID): Filter metrics by specific team
- `userId` (UUID): Filter metrics by specific user
- `taskStatus` (enum): Filter by task status (`PENDING`, `IN_PROGRESS`, `DONE`)
- `priority` (enum): Filter by priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- `companyId` (UUID): Filter by company (ADMIN only)

## Role-Specific Metrics

### ADMIN Metrics
**Scope**: Company-wide analytics

**Returns**:
- **Users**: Total, active count, breakdown by role (admin/manager/employee)
- **Teams**: Total teams, average team size, teams with most tasks
- **Tasks**: Total, by status, by priority, overdue count
- **Notifications**: Total, unread, by type (info/success/warning/error)
- **Productivity**: Tasks completed in period, top performers with completion counts
- **Recent Activity**: Total actions logged, top 5 actions by frequency

**Use Cases**:
- Monitor overall company health
- Identify top-performing teams and individuals
- Track workload distribution
- Analyze activity patterns

### MANAGER Metrics
**Scope**: Team and direct reports

**Returns**:
- **Manager Info**: ID and name
- **Team Overview**: Team details, member count
- **Direct Reports**: List with individual task metrics (assigned, completed, completion rate)
- **Tasks**: Team tasks breakdown by status and priority
- **Team Productivity**: Tasks completed, average per member, top 3 performers
- **Notifications**: Manager's personal notifications

**Use Cases**:
- Monitor team performance
- Identify underperforming team members
- Track team task completion rates
- Manage workload distribution within team

### EMPLOYEE Metrics
**Scope**: Personal performance

**Returns**:
- **Employee Info**: ID, name, role
- **My Tasks**: Personal tasks by status and priority, overdue count
- **Performance**: Tasks completed, completion rate, tasks created
- **Team Ranking**: Position in team, total team members
- **Notifications**: Personal notifications
- **Upcoming Deadlines**: Next 5 tasks due within 7 days

**Use Cases**:
- Track personal productivity
- See position relative to team
- Monitor upcoming deadlines
- Analyze personal task patterns

## Example Requests

### Admin: Get company metrics for last quarter
```http
GET /metrics?startDate=2024-10-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Manager: Get team metrics filtered by priority
```http
GET /metrics?priority=HIGH&startDate=2024-12-01
Authorization: Bearer <token>
```

### Employee: Get personal metrics
```http
GET /metrics
Authorization: Bearer <token>
```

### Admin: Get specific team metrics
```http
GET /metrics?teamId=123e4567-e89b-12d3-a456-426614174000&startDate=2024-12-01
Authorization: Bearer <token>
```

## Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Metrics retrieved successfully",
  "data": {
    // Role-specific metrics object
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 404
}
```

## Metrics Calculation Details

### Period Defaults
- If no `startDate` is provided: defaults to 30 days ago
- If no `endDate` is provided: defaults to current date/time

### Task Status Counts
- **Pending**: Tasks with `PENDING` status
- **In Progress**: Tasks with `IN_PROGRESS` status
- **Done**: Tasks with `DONE` status
- **Overdue**: Tasks with due date in the past and status not `DONE`

### Priority Distribution
Tasks are counted by priority levels: LOW, MEDIUM, HIGH, URGENT

### Completion Rate
Calculated as: `(completed tasks / total tasks) * 100`

### Team Ranking (Employee)
Ranks are calculated by sorting team members by completed tasks in the specified period

## Performance Considerations

The service uses:
- Parallel database queries where possible
- Efficient aggregation with Prisma
- Indexed queries on userId, teamId, createdAt, and status fields
- Optimized counting operations

## Future Enhancements

Potential improvements:
- Average task completion time tracking (requires task state change logs)
- Trend analysis (compare periods)
- Export functionality (PDF/Excel)
- Configurable KPIs per role
- Real-time metrics via WebSocket
- Custom dashboard configurations
