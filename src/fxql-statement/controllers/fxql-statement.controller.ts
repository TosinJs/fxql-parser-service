import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FxqlStatementService } from '../services/fxql/fxql-statement.service';
import { CreateFxqlStatementDto } from '../dto/create-fxql-statement.dto';
import {
  createResponse,
  ErrorResponse,
  Response,
} from '../../utils/responseBuilder.utils';

@ApiTags('FXQL-Statement')
@Controller('fxql-statement')
export class FxqlStatementController {
  constructor(private readonly fxqlStatementService: FxqlStatementService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: Response,
  })
  @ApiBadRequestResponse({
    description: 'The request did not meet the validation criteria.',
    type: ErrorResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'The application crahsed no non-user related issues.',
    type: ErrorResponse,
  })
  async create(@Body() createFxqlStatementDto: CreateFxqlStatementDto) {
    const data = await this.fxqlStatementService.create(createFxqlStatementDto);
    return createResponse({ statusCode: HttpStatus.CREATED, data });
  }
}
