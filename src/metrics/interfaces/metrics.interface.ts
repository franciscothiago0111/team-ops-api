export interface TaskMetrics {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  overdue: number;
}

export interface UserMetrics {
  total: number;
  active: number;
  byRole: {
    admin: number;
    manager: number;
    employee: number;
  };
}

export interface TeamMetrics {
  total: number;
  averageTeamSize: number;
  teamsWithMostTasks: Array<{
    teamId: string;
    teamName: string;
    taskCount: number;
  }>;
}

export interface NotificationMetrics {
  total: number;
  unread: number;
  byType: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
}

export interface ProductivityMetrics {
  tasksCompletedInPeriod: number;
  averageCompletionTime: number;
  mostProductiveUsers: Array<{
    userId: string;
    userName: string;
    tasksCompleted: number;
  }>;
}

// ADMIN Metrics - Full company overview
export interface AdminMetricsResponse {
  period: {
    startDate: Date;
    endDate: Date;
  };
  company: {
    id: string;
    name: string;
  };
  users: UserMetrics;
  teams: TeamMetrics;
  tasks: TaskMetrics;
  notifications: NotificationMetrics;
  productivity: ProductivityMetrics;
  recentActivity: {
    totalActions: number;
    topActions: Array<{
      action: string;
      count: number;
    }>;
  };
}

// MANAGER Metrics - Team and direct reports overview
export interface ManagerMetricsResponse {
  period: {
    startDate: Date;
    endDate: Date;
  };
  manager: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
    memberCount: number;
  };
  directReports: {
    total: number;
    users: Array<{
      userId: string;
      userName: string;
      tasksAssigned: number;
      tasksCompleted: number;
      completionRate: number;
    }>;
  };
  tasks: TaskMetrics;
  teamProductivity: {
    tasksCompletedInPeriod: number;
    averageTasksPerMember: number;
    topPerformers: Array<{
      userId: string;
      userName: string;
      tasksCompleted: number;
    }>;
  };
  notifications: NotificationMetrics;
}

// EMPLOYEE Metrics - Personal metrics
export interface EmployeeMetricsResponse {
  period: {
    startDate: Date;
    endDate: Date;
  };
  employee: {
    id: string;
    name: string;
    role: string;
  };
  myTasks: TaskMetrics;
  performance: {
    tasksCompletedInPeriod: number;
    completionRate: number;
    averageCompletionTime: number;
    tasksCreated: number;
  };
  team: {
    id: string;
    name: string;
    myRankInTeam: number;
    totalMembers: number;
  };
  notifications: NotificationMetrics;
  upcomingDeadlines: Array<{
    taskId: string;
    title: string;
    dueDate: Date;
    priority: string;
  }>;
}
