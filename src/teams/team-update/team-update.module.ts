import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';

import { TeamUpdateController } from './team-update.controller';
import { TeamUpdateService } from './team-update.service';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [TeamUpdateController],
  providers: [TeamUpdateService],
})
export class TeamUpdateModule {}
