import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { QueueModule } from '../queue/queue.module';
import { TaskListener } from './listeners/task.listener';
import { UserListener } from './listeners/user.listener';
import { EventDispatcherService } from './services/event-dispatcher.service';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Configurações do event emitter
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    QueueModule,
  ],
  providers: [TaskListener, UserListener, EventDispatcherService],
  exports: [EventDispatcherService],
})
export class EventsModule {}
