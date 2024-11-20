import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { FxqlStatementService } from '../services/fxql/fxql-statement.service';
import { CreateFxqlStatementDto } from '../dto/create-fxql-statement.dto';
import { createResponse } from 'src/utils/responseBuilder.utils';

@Controller('fxql-statement')
export class FxqlStatementController {
  constructor(private readonly fxqlStatementService: FxqlStatementService) {}

  @Post()
  async create(@Body() createFxqlStatementDto: CreateFxqlStatementDto) {
    const data = await this.fxqlStatementService.create(createFxqlStatementDto);
    return createResponse({ statusCode: HttpStatus.OK, data });
  }
}
