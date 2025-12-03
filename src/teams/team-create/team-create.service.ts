import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';
import {
  EventDispatcherService,
  EVENT_NAMES,
  TeamCreatedEvent,
} from 'src/events';

import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamCreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async create(createTeamDto: CreateTeamDto, currentUser: UserPayload) {
    // Validate company
    const company = await this.prisma.company.findUnique({
      where: { id: currentUser.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Validate members if provided
    if (createTeamDto.memberIds && createTeamDto.memberIds.length > 0) {
      const members = await this.prisma.user.findMany({
        where: {
          id: { in: createTeamDto.memberIds },
        },
      });

      if (members.length !== createTeamDto.memberIds.length) {
        throw new NotFoundException('One or more members not found');
      }

      // Check if all members belong to the same company
      const invalidMembers = members.filter(
        (member) => member.companyId !== currentUser.companyId,
      );

      if (invalidMembers.length > 0) {
        throw new ForbiddenException(
          'All members must belong to the same company',
        );
      }
    }

    // Create the team
    const team = await this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        companyId: company.id,
        managerId: createTeamDto.managerId,
      },
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

    // Add members to team if provided
    if (createTeamDto.memberIds && createTeamDto.memberIds.length > 0) {
      await this.prisma.user.updateMany({
        where: {
          id: { in: createTeamDto.memberIds },
        },
        data: {
          teamId: team.id,
        },
      });
    }

    // Emit TEAM_CREATED event
    this.eventDispatcher.dispatch(
      EVENT_NAMES.TEAM_CREATED,
      new TeamCreatedEvent(team.id, team.name, team.companyId, currentUser.id),
    );

    return team;
  }
}
