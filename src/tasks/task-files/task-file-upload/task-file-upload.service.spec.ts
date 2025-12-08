import { Test, TestingModule } from '@nestjs/testing';
import { TaskFileUploadService } from './task-file-upload.service';

describe('TaskFileUploadService', () => {
  let service: TaskFileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskFileUploadService],
    }).compile();

    service = module.get<TaskFileUploadService>(TaskFileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
