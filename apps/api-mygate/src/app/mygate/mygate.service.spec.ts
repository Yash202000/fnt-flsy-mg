import { Test, TestingModule } from '@nestjs/testing';
import { MyGateService } from './mygate.service';

describe('MyGateService', () => {
  let service: MyGateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyGateService],
    }).compile();

    service = module.get<MyGateService>(MyGateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
