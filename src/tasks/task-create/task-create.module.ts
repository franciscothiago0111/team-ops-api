import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';
import { EventsModule } from 'src/events/events.module';

import { TaskCreateController } from './task-create.controller';
import { TaskCreateService } from './task-create.service';

@Module({
  imports: [DatabaseModule, CommonModule, EventsModule],
  controllers: [TaskCreateController],
  providers: [TaskCreateService],
})
export class TaskCreateModule {}
