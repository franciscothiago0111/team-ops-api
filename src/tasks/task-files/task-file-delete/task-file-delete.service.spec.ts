import { Test, TestingModule } from '@nestjs/testing';
import { TaskFileDeleteService } from './task-file-delete.service';

describe('TaskFileDeleteService', () => {
  let service: TaskFileDeleteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskFileDeleteService],
    }).compile();

    service = module.get<TaskFileDeleteService>(TaskFileDeleteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
