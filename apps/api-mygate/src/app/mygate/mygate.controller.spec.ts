import { Test, TestingModule } from '@nestjs/testing';
import { MyGateController } from './mygate.controller';

describe('MyGateController', () => {
  let controller: MyGateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyGateController],
    }).compile();

    controller = module.get<MyGateController>(MyGateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
