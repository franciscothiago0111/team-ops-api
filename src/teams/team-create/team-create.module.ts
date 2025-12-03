import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';
import { EventsModule } from 'src/events/events.module';

import { TeamCreateController } from './team-create.controller';
import { TeamCreateService } from './team-create.service';

@Module({
  imports: [DatabaseModule, CommonModule, EventsModule],
  controllers: [TeamCreateController],
  providers: [TeamCreateService],
})
export class TeamCreateModule {}
