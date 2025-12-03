import { Test, TestingModule } from '@nestjs/testing';
import { TeamUpdateController } from './team-update.controller';
import { TeamUpdateService } from './team-update.service';

describe('TeamUpdateController', () => {
  let controller: TeamUpdateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamUpdateController],
      providers: [TeamUpdateService],
    }).compile();

    controller = module.get<TeamUpdateController>(TeamUpdateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
