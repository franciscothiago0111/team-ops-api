import { Test, TestingModule } from '@nestjs/testing';
import { TeamListService } from './team-list.service';

describe('TeamListService', () => {
  let service: TeamListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamListService],
    }).compile();

    service = module.get<TeamListService>(TeamListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
