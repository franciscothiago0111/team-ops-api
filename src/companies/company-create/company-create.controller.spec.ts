import { Test, TestingModule } from '@nestjs/testing';
import { CompanyCreateController } from './company-create.controller';
import { CompanyCreateService } from './company-create.service';

describe('CompanyCreateController', () => {
  let controller: CompanyCreateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyCreateController],
      providers: [CompanyCreateService],
    }).compile();

    controller = module.get<CompanyCreateController>(CompanyCreateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
