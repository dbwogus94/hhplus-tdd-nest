import { ApplicationException } from 'src/common/exception/application.exception';
import { ApplicationExceptionCode } from 'src/common/exception/exception-type';

export class InvalidUserIdException extends ApplicationException {
  constructor() {
    super(ApplicationExceptionCode.INVALID_USER_ID);
  }
}
