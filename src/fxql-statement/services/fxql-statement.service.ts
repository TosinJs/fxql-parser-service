import { Injectable } from '@nestjs/common';
import { CreateFxqlStatementDto } from '../dto/create-fxql-statement.dto';

@Injectable()
export class FxqlStatementService {
  create(createFxqlStatementDto: CreateFxqlStatementDto) {
    return 'This action adds a new fxqlStatement';
  }
}
