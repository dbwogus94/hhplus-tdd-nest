import { ApplicationException, ApplicationExceptionCode } from 'src/common';

export class ConflictPointOperationException extends ApplicationException {
  constructor() {
    super(ApplicationExceptionCode.CONFLICT_POINT_OPERATION_EXCEPTION);
  }
}
