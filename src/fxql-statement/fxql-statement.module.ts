import { Module } from '@nestjs/common';
import { FxqlStatementService } from './services/fxql/fxql-statement.service';
import { FxqlStatementController } from './controllers/fxql-statement.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatabaseFxqlStatementService } from './services/database/db.fxql.service';
import { FxqlParserService } from './services/fxql-parser/fxql-parser.service';

@Module({
  controllers: [FxqlStatementController],
  providers: [
    DatabaseFxqlStatementService,
    FxqlStatementService,
    FxqlParserService,
    PrismaService,
  ],
})
export class FxqlStatementModule {}
