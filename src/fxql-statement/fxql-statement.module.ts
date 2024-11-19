import { Module } from '@nestjs/common';
import { FxqlStatementService } from './services/fxql-statement.service';
import { FxqlStatementController } from './controllers/fxql-statement.controller';

@Module({
  controllers: [FxqlStatementController],
  providers: [FxqlStatementService],
})
export class FxqlStatementModule {}
