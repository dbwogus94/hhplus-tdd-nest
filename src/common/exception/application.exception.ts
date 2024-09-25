import { HttpException } from '@nestjs/common';
import {
  ApplicationExceptionCode,
  ApplicationExceptionRecord,
} from './exception-type';

export abstract class ApplicationException extends Error {
  /** 에러 메시지 */
  readonly message: string;
  /** 에러 상태값으로 HttpCode와 대응한다. */
  readonly state: number;

  constructor(readonly code: ApplicationExceptionCode) {
    super();
    Error.captureStackTrace(this);

    const { message, state } = ApplicationExceptionRecord[this.code];
    this.message = message;
    this.state = state;
  }

  toHttpException() {
    return new HttpException(this.message, this.state);
  }
}
