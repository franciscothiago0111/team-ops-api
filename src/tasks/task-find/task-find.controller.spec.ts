import { Test, TestingModule } from '@nestjs/testing';

import { TaskFindController } from './task-find.controller';
import { TaskFindService } from './task-find.service';

describe('TaskFindController', () => {
  let controller: TaskFindController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskFindController],
      providers: [TaskFindService],
    }).compile();

    controller = module.get<TaskFindController>(TaskFindController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
