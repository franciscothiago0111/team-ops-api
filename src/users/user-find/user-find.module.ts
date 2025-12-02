import { Module } from '@nestjs/common';
import { UserFindService } from './user-find.service';
import { UserFindController } from './user-find.controller';

@Module({
  controllers: [UserFindController],
  providers: [UserFindService],
})
export class UserFindModule {}
