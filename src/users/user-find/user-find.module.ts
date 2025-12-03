import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';

import { UserFindController } from './user-find.controller';
import { UserFindService } from './user-find.service';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [UserFindController],
  providers: [UserFindService],
})
export class UserFindModule {}
