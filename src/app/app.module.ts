import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { FxqlStatementModule } from '../fxql-statement/fxql-statement.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    FxqlStatementModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
