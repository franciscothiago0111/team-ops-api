import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';
import { Role } from 'src/database/generated/prisma/client';

import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamUpdateService } from './team-update.service';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamUpdateController {
  constructor(
    private readonly teamUpdateService: TeamUpdateService,
    private readonly responseService: ResponseService,
  ) {}

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    const updatedTeam = await this.teamUpdateService.update(
      id,
      updateTeamDto,
      user,
    );
    return this.responseService.success({
      message: 'Team updated successfully',
      data: updatedTeam,
    });
  }
}
