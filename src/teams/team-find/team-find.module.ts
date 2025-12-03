import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';

import { TeamFindController } from './team-find.controller';
import { TeamFindService } from './team-find.service';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [TeamFindController],
  providers: [TeamFindService],
})
export class TeamFindModule {}
