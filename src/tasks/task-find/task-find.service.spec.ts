import { Test, TestingModule } from '@nestjs/testing';

import { TaskFindService } from './task-find.service';

describe('TaskFindService', () => {
  let service: TaskFindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskFindService],
    }).compile();

    service = module.get<TaskFindService>(TaskFindService);
    console.log = jest.fn(); // Disable console.log during tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
