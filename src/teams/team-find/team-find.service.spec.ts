import { Test, TestingModule } from '@nestjs/testing';
import { TeamFindService } from './team-find.service';

describe('TeamFindService', () => {
  let service: TeamFindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamFindService],
    }).compile();

    service = module.get<TeamFindService>(TeamFindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
