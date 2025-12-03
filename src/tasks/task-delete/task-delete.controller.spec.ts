import { Test, TestingModule } from '@nestjs/testing';

import { TaskDeleteController } from './task-delete.controller';
import { TaskDeleteService } from './task-delete.service';

describe('TaskDeleteController', () => {
  let controller: TaskDeleteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskDeleteController],
      providers: [TaskDeleteService],
    }).compile();

    controller = module.get<TaskDeleteController>(TaskDeleteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
