import { Test, TestingModule } from '@nestjs/testing';

import { TaskCreateController } from './task-create.controller';
import { TaskCreateService } from './task-create.service';

describe('TaskCreateController', () => {
  let controller: TaskCreateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskCreateController],
      providers: [TaskCreateService],
    }).compile();

    controller = module.get<TaskCreateController>(TaskCreateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
