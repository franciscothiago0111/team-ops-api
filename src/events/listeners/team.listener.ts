import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { QueueService } from '../../queue/services/queue.service';
import { EVENT_NAMES } from '../constants/event-names.constant';
import * as TeamEvents from '../interfaces/team-event.interface';

@Injectable()
export class TeamListener {
  private readonly logger = new Logger(TeamListener.name);

  constructor(private readonly queueService: QueueService) {}

  @OnEvent(EVENT_NAMES.TEAM_CREATED)
  async handleTeamCreated(payload: TeamEvents.TeamCreatedEvent) {
    this.logger.log(`Team created: ${payload.name} (${payload.teamId})`);

    // Adicionar log à fila
    await this.queueService.addLogJob({
      action: 'TEAM_CREATED',
      entity: 'Team',
      entityId: payload.teamId,
      userId: payload.createdById,
      companyId: payload.companyId,
      metadata: {
        name: payload.name,
        teamId: payload.teamId,
      },
    });
  }
}
