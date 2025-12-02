import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';

import { NotificationsGateway } from './gateways/notifications.gateway';

@Module({
  imports: [AuthModule],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class WebsocketModule {}
