import { Injectable } from '@nestjs/common';

import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

import { TeamListDto } from './dto/team-list.dto';

@Injectable()
export class TeamListService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeams(currentUser: UserPayload, query: TeamListDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const where = {};

    // where.companyId = currentUser.companyId;
    Object.assign(where, { companyId: currentUser.companyId });

    if (query.name) {
      Object.assign(where, {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
      });
    }

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          companyId: true,
          managerId: true,
          members: {
            select: {
              id: true,
              name: true,
            },
          },
          manager: {
            select: {
              name: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.team.count({ where }),
    ]);

    return {
      data: teams,
      total,
      currentPage: page,
      limit,
    };
  }
}
