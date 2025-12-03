import { Test, TestingModule } from '@nestjs/testing';

import { TaskUpdateService } from './task-update.service';

describe('TaskUpdateService', () => {
  let service: TaskUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskUpdateService],
    }).compile();

    service = module.get<TaskUpdateService>(TaskUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
