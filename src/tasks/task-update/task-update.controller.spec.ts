import { Test, TestingModule } from '@nestjs/testing';

import { TaskUpdateController } from './task-update.controller';
import { TaskUpdateService } from './task-update.service';

describe('TaskUpdateController', () => {
  let controller: TaskUpdateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskUpdateController],
      providers: [TaskUpdateService],
    }).compile();

    controller = module.get<TaskUpdateController>(TaskUpdateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
