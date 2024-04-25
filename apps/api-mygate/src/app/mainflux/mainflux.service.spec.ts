import { Test, TestingModule } from '@nestjs/testing';
import { MainFluxService } from './mainflux.service';

describe('MainFluxService', () => {
  let service: MainFluxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainFluxService],
    }).compile();

    service = module.get<MainFluxService>(MainFluxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
