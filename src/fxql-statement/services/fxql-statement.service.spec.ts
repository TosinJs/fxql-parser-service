import { Test, TestingModule } from '@nestjs/testing';
import { FxqlStatementService } from './fxql-statement.service';

describe('FxqlStatementService', () => {
  let service: FxqlStatementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FxqlStatementService],
    }).compile();

    service = module.get<FxqlStatementService>(FxqlStatementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
