import { Module } from '@nestjs/common';
import { UserUpdateService } from './user-update.service';
import { UserUpdateController } from './user-update.controller';

@Module({
  controllers: [UserUpdateController],
  providers: [UserUpdateService],
})
export class UserUpdateModule {}
