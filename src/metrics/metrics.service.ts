import { Injectable, NotFoundException } from '@nestjs/common';

import { Role } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';

import { MetricsDto } from './dto/metrics.dto';
import {
  AdminMetricsResponse,
  ManagerMetricsResponse,
  EmployeeMetricsResponse,
} from './interfaces/metrics.interface';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetricsByUserRole(
    userId: string,
    query: MetricsDto,
  ): Promise<
    AdminMetricsResponse | ManagerMetricsResponse | EmployeeMetricsResponse
  > {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true, team: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    switch (user.role) {
      case Role.ADMIN:
        return this.getAdminMetrics(user, startDate, endDate, query);
      case Role.MANAGER:
        return this.getManagerMetrics(user, startDate, endDate, query);
      case Role.EMPLOYEE:
        return this.getEmployeeMetrics(user, startDate, endDate, query);
      default:
        throw new Error('Invalid user role');
    }
  }

  private async getAdminMetrics(
    user: any,
    startDate: Date,
    endDate: Date,
    query: MetricsDto,
  ): Promise<AdminMetricsResponse> {
    const companyId = query.companyId || user.companyId;

    // Build task filter
    const taskFilter: any = {
      team: { companyId },
      createdAt: { gte: startDate, lte: endDate },
    };
    if (query.teamId) taskFilter.teamId = query.teamId;
    if (query.taskStatus) taskFilter.status = query.taskStatus;
    if (query.priority) taskFilter.priority = query.priority;
    if (query.userId) taskFilter.assignedToId = query.userId;

    // Fetch all metrics in parallel
    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      doneTasks,
      lowPriorityTasks,
      mediumPriorityTasks,
      highPriorityTasks,
      urgentPriorityTasks,
      overdueTasks,
      totalUsers,
      adminUsers,
      managerUsers,
      employeeUsers,
      totalTeams,
      teams,
      totalNotifications,
      unreadNotifications,
      infoNotifications,
      successNotifications,
      warningNotifications,
      errorNotifications,
      recentLogs,
    ] = await Promise.all([
      this.prisma.task.count({ where: taskFilter }),
      this.prisma.task.count({ where: { ...taskFilter, status: 'PENDING' } }),
      this.prisma.task.count({
        where: { ...taskFilter, status: 'IN_PROGRESS' },
      }),
      this.prisma.task.count({ where: { ...taskFilter, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'LOW' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'MEDIUM' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'HIGH' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'URGENT' } }),
      this.prisma.task.count({
        where: {
          ...taskFilter,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
      this.prisma.user.count({ where: { companyId } }),
      this.prisma.user.count({ where: { companyId, role: 'ADMIN' } }),
      this.prisma.user.count({ where: { companyId, role: 'MANAGER' } }),
      this.prisma.user.count({ where: { companyId, role: 'EMPLOYEE' } }),
      this.prisma.team.count({ where: { companyId } }),
      this.prisma.team.findMany({
        where: { companyId },
        include: { _count: { select: { tasks: true } } },
        orderBy: { tasks: { _count: 'desc' } },
        take: 5,
      }),
      this.prisma.notification.count({
        where: {
          user: { companyId },
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: { user: { companyId }, read: false },
      }),
      this.prisma.notification.count({
        where: {
          user: { companyId },
          type: 'INFO',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: {
          user: { companyId },
          type: 'SUCCESS',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: {
          user: { companyId },
          type: 'WARNING',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: {
          user: { companyId },
          type: 'ERROR',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.log.findMany({
        where: { companyId, createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
    ]);

    // Calculate team metrics
    const teamSizes = await this.prisma.team.findMany({
      where: { companyId },
      include: { _count: { select: { members: true } } },
    });
    const averageTeamSize =
      teamSizes.reduce((sum, team) => sum + team._count.members, 0) /
      (totalTeams || 1);

    // Calculate productivity metrics
    const topUsers = await this.prisma.user.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            assignedTasks: {
              where: {
                status: 'COMPLETED',
                updatedAt: { gte: startDate, lte: endDate },
              },
            },
          },
        },
      },
      orderBy: {
        assignedTasks: { _count: 'desc' },
      },
      take: 5,
    });

    // Process logs for activity
    const actionCounts = recentLogs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));

    return {
      period: { startDate, endDate },
      company: {
        id: user.company.id,
        name: user.company.name,
      },
      users: {
        total: totalUsers,
        active: totalUsers,
        byRole: {
          admin: adminUsers,
          manager: managerUsers,
          employee: employeeUsers,
        },
      },
      teams: {
        total: totalTeams,
        averageTeamSize,
        teamsWithMostTasks: teams.map((team) => ({
          teamId: team.id,
          teamName: team.name,
          taskCount: team._count.tasks,
        })),
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        byPriority: {
          low: lowPriorityTasks,
          medium: mediumPriorityTasks,
          high: highPriorityTasks,
          urgent: urgentPriorityTasks,
        },
        overdue: overdueTasks,
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: {
          info: infoNotifications,
          success: successNotifications,
          warning: warningNotifications,
          error: errorNotifications,
        },
      },
      productivity: {
        tasksCompletedInPeriod: doneTasks,
        averageCompletionTime: 0, // Would need task completion time tracking
        mostProductiveUsers: topUsers.map((u) => ({
          userId: u.id,
          userName: u.name || 'Unknown User',
          tasksCompleted: u._count.assignedTasks,
        })),
      },
      recentActivity: {
        totalActions: recentLogs.length,
        topActions,
      },
    };
  }

  private async getManagerMetrics(
    user: any,
    startDate: Date,
    endDate: Date,
    query: MetricsDto,
  ): Promise<ManagerMetricsResponse> {
    const teamId = query.teamId || user.teamId;

    if (!teamId) {
      throw new NotFoundException('Manager not assigned to a team');
    }

    // Build task filter
    const taskFilter: any = {
      teamId,
      createdAt: { gte: startDate, lte: endDate },
    };
    if (query.taskStatus) taskFilter.status = query.taskStatus;
    if (query.priority) taskFilter.priority = query.priority;
    if (query.userId) taskFilter.assignedToId = query.userId;

    // Fetch metrics
    const [
      team,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      doneTasks,
      lowPriorityTasks,
      mediumPriorityTasks,
      highPriorityTasks,
      urgentPriorityTasks,
      overdueTasks,
      directReports,
      totalNotifications,
      unreadNotifications,
      infoNotifications,
      successNotifications,
      warningNotifications,
      errorNotifications,
    ] = await Promise.all([
      this.prisma.team.findUnique({
        where: { id: teamId },
        include: { _count: { select: { members: true } } },
      }),
      this.prisma.task.count({ where: taskFilter }),
      this.prisma.task.count({ where: { ...taskFilter, status: 'PENDING' } }),
      this.prisma.task.count({
        where: { ...taskFilter, status: 'IN_PROGRESS' },
      }),
      this.prisma.task.count({ where: { ...taskFilter, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'LOW' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'MEDIUM' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'HIGH' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'URGENT' } }),
      this.prisma.task.count({
        where: {
          ...taskFilter,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
      this.prisma.user.findMany({
        where: { teamId },
        include: {
          _count: {
            select: {
              assignedTasks: { where: taskFilter },
            },
          },
        },
      }),
      this.prisma.notification.count({
        where: { userId: user.id, createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
      this.prisma.notification.count({
        where: {
          userId: user.id,
          type: 'INFO',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: {
          userId: user.id,
          type: 'SUCCESS',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: {
          userId: user.id,
          type: 'WARNING',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: {
          userId: user.id,
          type: 'ERROR',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    // Calculate direct reports metrics
    const directReportsWithMetrics = await Promise.all(
      directReports.map(async (employee) => {
        const [assigned, completed] = await Promise.all([
          this.prisma.task.count({
            where: {
              assignedToId: employee.id,
              teamId,
              createdAt: { gte: startDate, lte: endDate },
            },
          }),
          this.prisma.task.count({
            where: {
              assignedToId: employee.id,
              teamId,
              status: 'COMPLETED',
              updatedAt: { gte: startDate, lte: endDate },
            },
          }),
        ]);

        return {
          userId: employee.id,
          userName: employee.name || 'Unknown User',
          tasksAssigned: assigned,
          tasksCompleted: completed,
          completionRate: assigned > 0 ? (completed / assigned) * 100 : 0,
        };
      }),
    );

    // Get top performers
    const topPerformers = directReportsWithMetrics
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
      .slice(0, 3)
      .map((u) => ({
        userId: u.userId,
        userName: u.userName,
        tasksCompleted: u.tasksCompleted,
      }));

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return {
      period: { startDate, endDate },
      manager: {
        id: user.id,
        name: user.name,
      },
      team: {
        id: team.id,
        name: team.name,
        memberCount: team._count.members,
      },
      directReports: {
        total: directReports.length,
        users: directReportsWithMetrics,
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        byPriority: {
          low: lowPriorityTasks,
          medium: mediumPriorityTasks,
          high: highPriorityTasks,
          urgent: urgentPriorityTasks,
        },
        overdue: overdueTasks,
      },
      teamProductivity: {
        tasksCompletedInPeriod: doneTasks,
        averageTasksPerMember:
          team._count.members > 0 ? doneTasks / team._count.members : 0,
        topPerformers,
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: {
          info: infoNotifications,
          success: successNotifications,
          warning: warningNotifications,
          error: errorNotifications,
        },
      },
    };
  }

  private async getEmployeeMetrics(
    user: any,
    startDate: Date,
    endDate: Date,
    query: MetricsDto,
  ): Promise<EmployeeMetricsResponse> {
    // Build task filter
    const taskFilter: any = {
      assignedToId: user.id,
      createdAt: { gte: startDate, lte: endDate },
    };
    if (query.taskStatus) taskFilter.status = query.taskStatus;
    if (query.priority) taskFilter.priority = query.priority;

    // Fetch metrics
    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      doneTasks,
      lowPriorityTasks,
      mediumPriorityTasks,
      highPriorityTasks,
      urgentPriorityTasks,
      overdueTasks,
      tasksCreated,
      totalNotifications,
      unreadNotifications,
      infoNotifications,
      successNotifications,
      warningNotifications,
      errorNotifications,
      upcomingTasks,
    ] = await Promise.all([
      this.prisma.task.count({ where: taskFilter }),
      this.prisma.task.count({ where: { ...taskFilter, status: 'PENDING' } }),
      this.prisma.task.count({
        where: { ...taskFilter, status: 'IN_PROGRESS' },
      }),
      this.prisma.task.count({ where: { ...taskFilter, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'LOW' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'MEDIUM' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'HIGH' } }),
      this.prisma.task.count({ where: { ...taskFilter, priority: 'URGENT' } }),
      this.prisma.task.count({
        where: {
          ...taskFilter,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
      this.prisma.task.count({
        where: {
          createdById: user.id,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: { userId: user.id, createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
      this.prisma.notification.count({
        where: {
          userId: user.id,
          type: 'INFO',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: {
          userId: user.id,
          type: 'SUCCESS',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: {
          userId: user.id,
          type: 'WARNING',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.notification.count({
        where: {
          userId: user.id,
          type: 'ERROR',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.task.findMany({
        where: {
          assignedToId: user.id,
          status: { not: 'COMPLETED' },
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
    ]);

    // Get team info and rank
    let teamInfo: {
      id: string;
      name: string;
      myRankInTeam: number;
      totalMembers: number;
    } | null = null;
    if (user.teamId) {
      const [team, teamMembers] = await Promise.all([
        this.prisma.team.findUnique({
          where: { id: user.teamId },
          include: { _count: { select: { members: true } } },
        }),
        this.prisma.user.findMany({
          where: { teamId: user.teamId },
          include: {
            _count: {
              select: {
                assignedTasks: {
                  where: {
                    status: 'COMPLETED',
                    updatedAt: { gte: startDate, lte: endDate },
                  },
                },
              },
            },
          },
        }),
      ]);

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      const sortedMembers = teamMembers.sort(
        (a, b) => b._count.assignedTasks - a._count.assignedTasks,
      );
      const myRank =
        sortedMembers.findIndex((member) => member.id === user.id) + 1;

      teamInfo = {
        id: team.id,
        name: team.name,
        myRankInTeam: myRank,
        totalMembers: team._count.members,
      };
    }

    return {
      period: { startDate, endDate },
      employee: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      myTasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        byPriority: {
          low: lowPriorityTasks,
          medium: mediumPriorityTasks,
          high: highPriorityTasks,
          urgent: urgentPriorityTasks,
        },
        overdue: overdueTasks,
      },
      performance: {
        tasksCompletedInPeriod: doneTasks,
        completionRate: totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0,
        averageCompletionTime: 0, // Would need completion time tracking
        tasksCreated,
      },
      team: teamInfo || {
        id: '',
        name: 'No team assigned',
        myRankInTeam: 0,
        totalMembers: 0,
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: {
          info: infoNotifications,
          success: successNotifications,
          warning: warningNotifications,
          error: errorNotifications,
        },
      },
      upcomingDeadlines: upcomingTasks
        .filter((task) => task.dueDate !== null)
        .map((task) => ({
          taskId: task.id,
          title: task.name,
          dueDate: task.dueDate as Date,
          priority: task.priority,
        })),
    };
  }
}
