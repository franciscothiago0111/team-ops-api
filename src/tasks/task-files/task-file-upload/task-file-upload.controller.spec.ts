import { Test, TestingModule } from '@nestjs/testing';
import { TaskFileUploadController } from './task-file-upload.controller';
import { TaskFileUploadService } from './task-file-upload.service';

describe('TaskFileUploadController', () => {
  let controller: TaskFileUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskFileUploadController],
      providers: [TaskFileUploadService],
    }).compile();

    controller = module.get<TaskFileUploadController>(TaskFileUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
