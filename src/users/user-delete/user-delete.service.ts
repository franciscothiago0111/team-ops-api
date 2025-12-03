import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UserDeleteService {
  constructor(private readonly prisma: PrismaService) {}

  async delete(userId: string, currentUser: UserPayload) {
    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cannot delete yourself
    if (user.id === currentUser.id) {
      throw new BadRequestException('You cannot delete yourself');
    }

    // Check permissions
    if (currentUser.role === 'MANAGER') {
      // Managers can only delete users in their company
      if (user.companyId !== currentUser.companyId) {
        throw new ForbiddenException(
          'You can only delete users from your company',
        );
      }

      // Managers cannot delete ADMIN users
      if (user.role === 'ADMIN') {
        throw new ForbiddenException('Managers cannot delete ADMIN users');
      }
    }

    // Delete the user
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { id: userId };
  }
}
