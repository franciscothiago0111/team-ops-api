import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UserFindService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: string, currentUser: UserPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        teamId: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },

        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check access: ADMIN can see anyone, others can only see users in same company
    if (
      currentUser.role !== 'ADMIN' &&
      user.companyId !== currentUser.companyId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this user',
      );
    }

    return user;
  }
}
