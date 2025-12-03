import { Test, TestingModule } from '@nestjs/testing';
import { TeamUpdateService } from './team-update.service';

describe('TeamUpdateService', () => {
  let service: TeamUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamUpdateService],
    }).compile();

    service = module.get<TeamUpdateService>(TeamUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
