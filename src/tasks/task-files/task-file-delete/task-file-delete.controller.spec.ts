import { Test, TestingModule } from '@nestjs/testing';
import { TaskFileDeleteController } from './task-file-delete.controller';
import { TaskFileDeleteService } from './task-file-delete.service';

describe('TaskFileDeleteController', () => {
  let controller: TaskFileDeleteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskFileDeleteController],
      providers: [TaskFileDeleteService],
    }).compile();

    controller = module.get<TaskFileDeleteController>(TaskFileDeleteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
