import { Test, TestingModule } from '@nestjs/testing';
import { MyGateCardsService } from './mygate-cards.service';

describe('MyGateCardsService', () => {
  let service: MyGateCardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyGateCardsService],
    }).compile();

    service = module.get<MyGateCardsService>(MyGateCardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
