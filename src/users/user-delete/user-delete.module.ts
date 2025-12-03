import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';

import { UserDeleteController } from './user-delete.controller';
import { UserDeleteService } from './user-delete.service';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [UserDeleteController],
  providers: [UserDeleteService],
})
export class UserDeleteModule {}
