import { Injectable } from '@nestjs/common';

import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

import { UserListDto } from './dto/user-list.dto';

@Injectable()
export class UserListService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(currentUser: UserPayload, query: UserListDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    Object.assign(where, { companyId: currentUser.companyId });

    if (query.role) {
      Object.assign(where, { role: query.role });
    }

    if (query.withoutTeam) {
      Object.assign(where, { teamId: null });
    }

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          companyId: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prismaService.user.count({ where }),
    ]);
    return {
      data: users,
      total,
      currentPage: page,
      limit,
    };
  }
}
