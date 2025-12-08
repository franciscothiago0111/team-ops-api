import { Test, TestingModule } from '@nestjs/testing';
import { TaskFileListService } from './task-file-list.service';

describe('TaskFileListService', () => {
  let service: TaskFileListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskFileListService],
    }).compile();

    service = module.get<TaskFileListService>(TaskFileListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
