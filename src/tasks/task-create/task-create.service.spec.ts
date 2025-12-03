import { Test, TestingModule } from '@nestjs/testing';

import { TaskCreateService } from './task-create.service';

describe('TaskCreateService', () => {
  let service: TaskCreateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskCreateService],
    }).compile();

    service = module.get<TaskCreateService>(TaskCreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
