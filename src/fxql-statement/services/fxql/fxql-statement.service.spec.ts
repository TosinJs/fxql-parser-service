import { Test, TestingModule } from '@nestjs/testing';
import { FxqlStatementService } from './fxql-statement.service';
import { DatabaseFxqlStatementService } from '../database/db.fxql.service';
import { FxqlParserService } from '../fxql-parser/fxql-parser.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('FxqlStatementService', () => {
  let service: FxqlStatementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxqlStatementService,
        DatabaseFxqlStatementService,
        FxqlParserService,
        PrismaService,
      ],
    }).compile();

    service = module.get<FxqlStatementService>(FxqlStatementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
