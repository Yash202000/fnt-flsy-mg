import { Test, TestingModule } from '@nestjs/testing';
import { MyGateLogsService } from './mygate-logs.service';

describe('MyGateLogsService', () => {
  let service: MyGateLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyGateLogsService],
    }).compile();

    service = module.get<MyGateLogsService>(MyGateLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
