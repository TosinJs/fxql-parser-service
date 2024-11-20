import { HttpStatus } from '@nestjs/common';

type ErrorName = 'FXQL_PARSER_ERROR' | 'DB_ERROR';

export class ServiceError extends Error {
  readonly statusCode: number;
  readonly name: ErrorName;

  constructor(statusCode: number, name: ErrorName, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadFxqlRequestErrorWithMessage extends ServiceError {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, 'FXQL_PARSER_ERROR', message);
  }
}

export class InternalServerError extends ServiceError {
  constructor(message: string, name: ErrorName) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, name, message);
  }
}
