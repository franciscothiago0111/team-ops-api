import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';
import { Role } from 'src/database/generated/prisma/client';

import { CreateTeamDto } from './dto/create-team.dto';
import { TeamCreateService } from './team-create.service';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamCreateController {
  constructor(
    private readonly teamCreateService: TeamCreateService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires ADMIN or MANAGER role',
  })
  async create(
    @CurrentUser() user: UserPayload,
    @Body() createTeamDto: CreateTeamDto,
  ) {
    const newTeam = await this.teamCreateService.create(createTeamDto, user);
    return this.responseService.success({
      message: 'Team created successfully',
      data: newTeam,
    });
  }
}
