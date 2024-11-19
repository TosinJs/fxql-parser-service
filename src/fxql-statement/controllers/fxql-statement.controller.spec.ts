import { Test, TestingModule } from '@nestjs/testing';
import { FxqlStatementController } from './fxql-statement.controller';
import { FxqlStatementService } from '../services/fxql-statement.service';

describe('FxqlStatementController', () => {
  let controller: FxqlStatementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FxqlStatementController],
      providers: [FxqlStatementService],
    }).compile();

    controller = module.get<FxqlStatementController>(FxqlStatementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
