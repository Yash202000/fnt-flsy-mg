import { Test, TestingModule } from '@nestjs/testing';
import { MyGateLogsController } from './mygate-logs.controller';

describe('MyGateLogsController', () => {
  let controller: MyGateLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyGateLogsController],
    }).compile();

    controller = module.get<MyGateLogsController>(MyGateLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
