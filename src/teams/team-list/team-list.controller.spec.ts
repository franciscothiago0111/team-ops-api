import { Test, TestingModule } from '@nestjs/testing';
import { TeamListController } from './team-list.controller';
import { TeamListService } from './team-list.service';

describe('TeamListController', () => {
  let controller: TeamListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamListController],
      providers: [TeamListService],
    }).compile();

    controller = module.get<TeamListController>(TeamListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
