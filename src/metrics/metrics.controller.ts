import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { MetricsDto } from './dto/metrics.dto';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@ApiBearerAuth()
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get metrics based on user role',
    description:
      'Returns role-specific metrics: ADMIN gets company-wide metrics, MANAGER gets team metrics, EMPLOYEE gets personal metrics. Supports filtering by date range, team, user, task status, and priority.',
  })
  async getMetrics(
    @CurrentUser() user: UserPayload,
    @Query() query: MetricsDto,
  ) {
    const result = await this.metricsService.getMetricsByUserRole(
      user.id,
      query,
    );
    return this.responseService.success({
      data: result,
      message: 'Metrics retrieved successfully',
    });
  }
}
