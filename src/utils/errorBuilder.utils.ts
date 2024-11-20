import { HttpStatus } from '@nestjs/common';

type ErrorName = 'FXQL_PARSER_ERROR' | 'DB_ERROR';

export class ServiceError extends Error {
  readonly statusCode: number;
  readonly name: ErrorName;
  readonly internalMessage: string;

  constructor(
    statusCode: number,
    name: ErrorName,
    message: string,
    internalMessage?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    this.internalMessage = internalMessage;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadFxqlRequestErrorWithMessage extends ServiceError {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, 'FXQL_PARSER_ERROR', message);
  }
}

export class DBInternalServerError extends ServiceError {
  constructor(message: string, internalMesssage: string, name: ErrorName) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, name, message, internalMesssage);
  }
}
