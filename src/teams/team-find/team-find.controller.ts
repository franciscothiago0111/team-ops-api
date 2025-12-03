import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { TeamFindService } from './team-find.service';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamFindController {
  constructor(
    private readonly teamFindService: TeamFindService,
    private readonly responseService: ResponseService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team found' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const team = await this.teamFindService.findOne(id, user);
    return this.responseService.success({
      message: 'Team retrieved successfully',
      data: team,
    });
  }
}
