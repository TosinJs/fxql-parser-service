import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { FxqlStatementModule } from 'src/fxql-statement/fxql-statement.module';

@Module({
  imports: [FxqlStatementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
