import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import process from 'process';
import { ServiceError } from '../errorBuilder.utils';
import { createResponse } from '../responseBuilder.utils';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';

    if (exception instanceof BadRequestException) {
      message = exception.getResponse();
      statusCode = HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof ServiceError) {
      message = exception.message;
      statusCode = exception.statusCode;
    }

    const devResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      trace: exception?.stack?.split('/n'),
      error: exception,
    };

    // log devResponse
    this.logger.error(
      `Exception caught: ${JSON.stringify(devResponse, null, 2)}`,
    );

    let formattedMessage = '';

    try {
      formattedMessage =
        typeof formattedMessage === 'object'
          ? JSON.stringify(message)
          : (message as string);
    } catch (error) {
      formattedMessage = 'Internal Server Error';
    }

    const prodResponse = createResponse({
      statusCode,
      message: formattedMessage,
    });

    response
      .status(statusCode)
      .json(process?.env?.ENV == 'DEVELOPMENT' ? devResponse : prodResponse);
  }
}

@Catch()
export class AllExceptionsFilterExtendsBase extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    super.catch(exception, host);
  }
}
