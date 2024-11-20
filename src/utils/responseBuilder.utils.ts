import { ApiProperty } from '@nestjs/swagger';
import { ParsedFxql } from '../fxql-statement/services/fxql-parser/fxql-parser.service';

export class Response {
  @ApiProperty({
    description: 'The response status code',
  })
  code: string;

  @ApiProperty({
    description: 'The response message',
  })
  message: string;

  @ApiProperty({
    description: 'The response data',
  })
  data: ParsedFxql | null;
}

export class ErrorResponse {
  @ApiProperty({
    description: 'The response status code',
  })
  code: string;

  @ApiProperty({
    description: 'The response message',
  })
  message: string;
}

export function createResponse({
  statusCode,
  message = 'Rates Parsed Successfully.',
  data,
}: {
  statusCode: number;
  message?: string;
  data?: any;
}): Response {
  return {
    message,
    code: `FXQL-${statusCode}`,
    data,
  };
}
