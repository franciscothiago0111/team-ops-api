import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { NotificationUnredCountService } from './notification-unred-count.service';

@Controller('notifications')
@ApiTags('notifications')
@ApiBearerAuth()
export class NotificationUnredCountController {
  constructor(
    private readonly notificationUnredCountService: NotificationUnredCountService,
    private readonly responseService: ResponseService,
  ) {}

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  async getUnreadCount(@CurrentUser() user: UserPayload) {
    const count =
      await this.notificationUnredCountService.getUnreadCount(user.id);
    return this.responseService.success({
      message: 'Unread count retrieved successfully',
      data: { count },
    });
  }
}
