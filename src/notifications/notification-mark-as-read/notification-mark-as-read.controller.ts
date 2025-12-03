import { Controller, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { NotificationMarkAsReadService } from './notification-mark-as-read.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications/:id/read')
export class NotificationMarkAsReadController {
  constructor(
    private readonly notificationMarkAsReadService: NotificationMarkAsReadService,
    private readonly responseService: ResponseService,
  ) {}

  @Patch()
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const data = await this.notificationMarkAsReadService.markAsRead(
      id,
      user.id,
    );

    return this.responseService.success({
      message: 'Notification marked as read successfully',
      data,
    });
  }
}
