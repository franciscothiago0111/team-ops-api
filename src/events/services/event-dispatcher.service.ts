import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  UserCreatedEvent,
  EmployeeAddedEvent,
  TaskCreatedEvent,
  TaskAssignedEvent,
  TaskStatusUpdatedEvent,
  TaskCompletedEvent,
  TeamCreatedEvent,
} from '../events';

type DomainEvent =
  | UserCreatedEvent
  | EmployeeAddedEvent
  | TaskCreatedEvent
  | TaskAssignedEvent
  | TaskStatusUpdatedEvent
  | TaskCompletedEvent
  | TeamCreatedEvent;

@Injectable()
export class EventDispatcherService {
  private readonly logger = new Logger(EventDispatcherService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  dispatch(eventName: string, event: DomainEvent): void {
    this.logger.debug(`Dispatching event: ${eventName}`, event);
    this.eventEmitter.emit(eventName, event);
  }
}
