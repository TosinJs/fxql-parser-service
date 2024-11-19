import { Controller, Post, Body } from '@nestjs/common';
import { FxqlStatementService } from '../services/fxql-statement.service';
import { CreateFxqlStatementDto } from '../dto/create-fxql-statement.dto';

@Controller('fxql-statement')
export class FxqlStatementController {
  constructor(private readonly fxqlStatementService: FxqlStatementService) {}

  @Post()
  create(@Body() createFxqlStatementDto: CreateFxqlStatementDto) {
    return this.fxqlStatementService.create(createFxqlStatementDto);
  }
}
