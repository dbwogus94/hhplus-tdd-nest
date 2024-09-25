import { ApplicationException, ApplicationExceptionCode } from 'src/common';

export class InvalidPointAmountException extends ApplicationException {
  constructor() {
    super(ApplicationExceptionCode.INVALID_USER_ID);
  }
}
