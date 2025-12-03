import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';

import { TeamListController } from './team-list.controller';
import { TeamListService } from './team-list.service';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [TeamListController],
  providers: [TeamListService],
})
export class TeamListModule {}
