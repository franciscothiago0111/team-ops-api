import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { NotificationListDto } from './dto/notification-list-dto';
import { NotificationListService } from './notification-list.service';

@Controller('notifications')
@ApiTags('notifications')
@ApiBearerAuth()
export class NotificationListController {
  constructor(
    private readonly notificationListService: NotificationListService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  async getMyNotifications(
    @CurrentUser() user: UserPayload,
    @Query() query: NotificationListDto,
  ) {
    console.log('Fetching notifications for user:', user, 'with query:', query);

    const result = await this.notificationListService.getNotificationsForUser(
      user.id,
      query,
    );
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: 'Notifications retrieved successfully',
    });
  }
}
