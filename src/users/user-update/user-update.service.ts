import * as bcrypt from 'bcrypt';

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUser: UserPayload,
  ) {
    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        team: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (currentUser.role === 'MANAGER') {
      // Managers can only update users in their company
      if (user.companyId !== currentUser.companyId) {
        throw new ForbiddenException(
          'You can only update users from your company',
        );
      }

      // Managers cannot promote users to ADMIN
      if (updateUserDto.role === 'ADMIN') {
        throw new ForbiddenException('Managers cannot create ADMIN users');
      }
    }

    // Check email uniqueness if changing email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.role) updateData.role = updateUserDto.role;

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update the user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
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
      },
    });

    return updatedUser;
  }
}
