import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const responseObj = res as Record<string, any>;
        message = responseObj.message || exception.message;
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message[0] || 'Validation error';
          errors = responseObj.message;
        } else if (responseObj.errors) {
          errors = Array.isArray(responseObj.errors)
            ? responseObj.errors
            : [responseObj.errors];
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${request?.method || 'UNKNOWN'}] ${request?.url || ''} - Unhandled Exception: ${exception.message}`,
        exception.stack,
      );

      // In production, do not leak raw database/system error messages
      if (process.env.NODE_ENV === 'production') {
        message = 'An unexpected internal server error occurred';
      } else {
        message = exception.message;
      }
    } else {
      this.logger.error(`Unknown exception: ${JSON.stringify(exception)}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
