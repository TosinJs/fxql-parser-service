import { Injectable } from '@nestjs/common';
import { CreateFxqlStatementDto } from '../../dto/create-fxql-statement.dto';
import { DatabaseFxqlStatementService } from '../database/db.fxql.service';
import {
  FxqlParserService,
  ParsedFxql,
} from '../fxql-parser/fxql-parser.service';

@Injectable()
export class FxqlStatementService {
  constructor(
    private dbFxqlService: DatabaseFxqlStatementService,
    private fxqlParserService: FxqlParserService,
  ) {}

  async create(
    createFxqlStatementDto: CreateFxqlStatementDto,
  ): Promise<ParsedFxql[]> {
    const parsedFxql = this.fxqlParserService.parseFxqlStatement(
      createFxqlStatementDto.FXQL,
    );
    await this.dbFxqlService.insertFxqlStatement(parsedFxql);

    return parsedFxql;
  }
}
