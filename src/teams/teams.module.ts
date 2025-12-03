import { Module } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { TeamCreateModule } from './team-create/team-create.module';
import { TeamFindModule } from './team-find/team-find.module';
import { TeamListModule } from './team-list/team-list.module';
import { TeamUpdateModule } from './team-update/team-update.module';

@Module({
  imports: [
    EventsModule,
    TeamCreateModule,
    TeamListModule,
    TeamFindModule,
    TeamUpdateModule,
  ],
})
export class TeamsModule {}
