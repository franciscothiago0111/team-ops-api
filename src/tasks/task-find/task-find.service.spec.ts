import { Test, TestingModule } from '@nestjs/testing';

import { TaskFindService } from './task-find.service';

describe('TaskFindService', () => {
  let service: TaskFindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskFindService],
    }).compile();

    service = module.get<TaskFindService>(TaskFindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
