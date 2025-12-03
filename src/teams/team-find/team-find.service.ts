import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TeamFindService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(teamId: string, currentUser: UserPayload) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tasks: {
          select: {
            id: true,
            name: true,
            status: true,
            assignedToId: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check access: ADMIN can see any team, others can only see teams in same company
    if (
      currentUser.role !== 'ADMIN' &&
      team.companyId !== currentUser.companyId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this team',
      );
    }

    return team;
  }
}
