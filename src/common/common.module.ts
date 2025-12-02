import { Global, Module } from '@nestjs/common';

import { ResponseService } from './services';

@Global()
@Module({
  providers: [ResponseService],
  exports: [ResponseService],
})
export class CommonModule {}
