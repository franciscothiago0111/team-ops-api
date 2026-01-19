import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';
import { Role } from 'src/database/generated/prisma/enums';

import { LogListDto } from './dto/log-list.dto';
import { LogListService } from './log-list.service';

@ApiTags('logs')
@Controller('logs')
@ApiBearerAuth()
export class LogListController {
  constructor(
    private readonly logListService: LogListService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get list of logs' })
  async list(
    @CurrentUser() user: UserPayload,
    @Query() logListDto: LogListDto,
  ) {
    const result = await this.logListService.list(user.id, logListDto);
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: 'Logs retrieved successfully',
    });
  }
}
