import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/auth/decorators/public.decorator';
import { ResponseService } from 'src/common/services';

import { CompanyCreateService } from './company-create.service';
import { CreateCompanyDto } from './dto/company-create.dto';

@ApiTags('companies')
@Controller('companies')
export class CompanyCreateController {
  constructor(
    private readonly companyCreateService: CompanyCreateService,
    private readonly responseService: ResponseService,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    await this.companyCreateService.create(createCompanyDto);
    return this.responseService.success({
      message: 'Company created successfully',
    });
  }
}
