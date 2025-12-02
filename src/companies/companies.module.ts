import { Module } from '@nestjs/common';

import { CompanyCreateModule } from './company-create/company-create.module';

@Module({
  imports: [CompanyCreateModule],
})
export class CompaniesModule {}
