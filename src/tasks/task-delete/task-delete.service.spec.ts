import { Test, TestingModule } from '@nestjs/testing';

import { TaskDeleteService } from './task-delete.service';

describe('TaskDeleteService', () => {
  let service: TaskDeleteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskDeleteService],
    }).compile();

    service = module.get<TaskDeleteService>(TaskDeleteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
