import { Test, TestingModule } from '@nestjs/testing';
import { TeamFindController } from './team-find.controller';
import { TeamFindService } from './team-find.service';

describe('TeamFindController', () => {
  let controller: TeamFindController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamFindController],
      providers: [TeamFindService],
    }).compile();

    controller = module.get<TeamFindController>(TeamFindController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
