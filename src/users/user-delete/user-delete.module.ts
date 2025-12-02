import { Module } from '@nestjs/common';
import { UserDeleteService } from './user-delete.service';
import { UserDeleteController } from './user-delete.controller';

@Module({
  controllers: [UserDeleteController],
  providers: [UserDeleteService],
})
export class UserDeleteModule {}
