import { Test, TestingModule } from '@nestjs/testing';
import { TaskFileListController } from './task-file-list.controller';
import { TaskFileListService } from './task-file-list.service';

describe('TaskFileListController', () => {
  let controller: TaskFileListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskFileListController],
      providers: [TaskFileListService],
    }).compile();

    controller = module.get<TaskFileListController>(TaskFileListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
