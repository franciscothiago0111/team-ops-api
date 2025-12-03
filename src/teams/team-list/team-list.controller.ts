import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { TeamListDto } from './dto/team-list.dto';
import { TeamListService } from './team-list.service';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamListController {
  constructor(
    private readonly teamListService: TeamListService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get list of teams' })
  @ApiResponse({ status: 200, description: 'Teams retrieved successfully' })
  async getTeams(
    @CurrentUser() user: UserPayload,
    @Query() query: TeamListDto,
  ) {
    const result = await this.teamListService.getTeams(user, query);
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: 'Teams retrieved successfully',
    });
  }
}
