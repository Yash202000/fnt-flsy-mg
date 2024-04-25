import { Test, TestingModule } from '@nestjs/testing';
import { MyGateCardsController } from './mygate-cards.controller';

describe('MyGateCardsController', () => {
  let controller: MyGateCardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyGateCardsController],
    }).compile();

    controller = module.get<MyGateCardsController>(MyGateCardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
