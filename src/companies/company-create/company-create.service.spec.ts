import { Test, TestingModule } from '@nestjs/testing';
import { CompanyCreateService } from './company-create.service';

describe('CompanyCreateService', () => {
  let service: CompanyCreateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyCreateService],
    }).compile();

    service = module.get<CompanyCreateService>(CompanyCreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
