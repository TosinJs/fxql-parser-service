import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FXQLParserService } from '../fxql-parser/fxql-parser.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, FXQLParserService],
})
export class AppModule {}
