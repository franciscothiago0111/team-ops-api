import { Test, TestingModule } from '@nestjs/testing';
import { TeamCreateController } from './team-create.controller';
import { TeamCreateService } from './team-create.service';

describe('TeamCreateController', () => {
  let controller: TeamCreateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamCreateController],
      providers: [TeamCreateService],
    }).compile();

    controller = module.get<TeamCreateController>(TeamCreateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
