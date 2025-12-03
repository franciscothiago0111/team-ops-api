import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';

import { UserUpdateController } from './user-update.controller';
import { UserUpdateService } from './user-update.service';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [UserUpdateController],
  providers: [UserUpdateService],
})
export class UserUpdateModule {}
