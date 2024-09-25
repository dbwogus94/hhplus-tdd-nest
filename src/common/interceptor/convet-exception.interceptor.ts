import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import 'reflect-metadata';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApplicationException } from '../exception';

/** 예외를 HttpException으로 변환 역할을 수행하는 인터셉터  */
@Injectable()
export class ConvertExceptionInterceptor implements NestInterceptor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      // map((data) => data),
      catchError((err) =>
        throwError(() => {
          if (err instanceof HttpException) {
            return err;
          } else if (err instanceof ApplicationException) {
            return err.toHttpException();
          } else {
            this.logger.error(err, err.stack);
            return new InternalServerErrorException();
          }
        }),
      ),
    );
  }
}
