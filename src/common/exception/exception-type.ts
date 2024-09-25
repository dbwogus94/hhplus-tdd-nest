type ApplicationExceptionRecordValue = {
  /** 에러 메시지, 응답에도 사용된다. */
  message: string;

  /** http 에러 상태 코드 */
  state: number;
};
type ApplicationExceptionRecord = Record<
  ApplicationExceptionCode,
  ApplicationExceptionRecordValue
>;

export enum ApplicationExceptionCode {
  /** 유효하지 않은 UserId 사용시 발생하는 에러 코드 */
  INVALID_USER_ID = 'INVALID_USER_ID',
  /** 유효하지 않은 포인트 금액 사용시 발생하는 에러 코드 */
  INVALID_POINT_AMOUNT = 'INVALID_POINT_AMOUNT',
}

export const ApplicationExceptionRecord: ApplicationExceptionRecord = {
  [ApplicationExceptionCode.INVALID_USER_ID]: {
    message: '유효하지 않은 사용자 ID 입니다.',
    state: 400,
  },

  [ApplicationExceptionCode.INVALID_POINT_AMOUNT]: {
    message: '포인트 금액은 0보다 커야 합니다.',
    state: 400,
  },
} as const;
