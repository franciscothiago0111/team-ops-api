import { Test, TestingModule } from '@nestjs/testing';
import { TeamCreateService } from './team-create.service';

describe('TeamCreateService', () => {
  let service: TeamCreateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamCreateService],
    }).compile();

    service = module.get<TeamCreateService>(TeamCreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
