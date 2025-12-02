import { Module } from '@nestjs/common';
import { CompanyCreateService } from './company-create.service';
import { CompanyCreateController } from './company-create.controller';

@Module({
  controllers: [CompanyCreateController],
  providers: [CompanyCreateService],
})
export class CompanyCreateModule {}
