import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    teamId: string,
    updateTeamDto: UpdateTeamDto,
    currentUser: UserPayload,
  ) {
    // Find the team
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        company: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check permissions
    if (currentUser.role === 'MANAGER') {
      // Managers can only update teams in their company
      if (team.companyId !== currentUser.companyId) {
        throw new ForbiddenException(
          'You can only update teams from your company',
        );
      }

      // Managers cannot change team's company
      if (
        updateTeamDto.companyId &&
        updateTeamDto.companyId !== team.companyId
      ) {
        throw new ForbiddenException('Managers cannot change team company');
      }
    }

    // Validate company if changing
    if (updateTeamDto.companyId && updateTeamDto.companyId !== team.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: updateTeamDto.companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    // Validate members if provided
    if (updateTeamDto.memberIds) {
      const members = await this.prisma.user.findMany({
        where: {
          id: { in: updateTeamDto.memberIds },
        },
      });

      if (members.length !== updateTeamDto.memberIds.length) {
        throw new NotFoundException('One or more members not found');
      }

      // Check if all members belong to the same company as the team
      const companyId = updateTeamDto.companyId || team.companyId;
      const invalidMembers = members.filter(
        (member) => member.companyId !== companyId,
      );

      if (invalidMembers.length > 0) {
        throw new ForbiddenException(
          'All members must belong to the same company as the team',
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (updateTeamDto.name) updateData.name = updateTeamDto.name;
    if (updateTeamDto.companyId !== undefined)
      updateData.companyId = updateTeamDto.companyId;

    // Update the team
    const updatedTeam = await this.prisma.team.update({
      where: { id: teamId },
      data: updateData,
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
      },
    });

    // Update team members if memberIds provided
    if (updateTeamDto.memberIds !== undefined) {
      // Update all users: set teamId to this team if in memberIds, else remove from team
      await this.prisma.user.updateMany({
        where: {
          id: { in: updateTeamDto.memberIds },
        },
        data: {
          teamId: teamId,
        },
      });

      // Remove users not in the list from this team
      await this.prisma.user.updateMany({
        where: {
          teamId: teamId,
          id: { notIn: updateTeamDto.memberIds },
        },
        data: {
          teamId: null,
        },
      });
    }

    return updatedTeam;
  }
}
