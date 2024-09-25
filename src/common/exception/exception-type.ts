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
  INVALID_USER_ID = 'INVALID_USER_ID',
  INVALID_CHARGE_AMOUNT = 'INVALID_CHARGE_AMOUNT',
}

export const ApplicationExceptionRecord: ApplicationExceptionRecord = {
  [ApplicationExceptionCode.INVALID_USER_ID]: {
    message: '유효하지 않은 사용자 ID 입니다.',
    state: 400,
  },

  [ApplicationExceptionCode.INVALID_CHARGE_AMOUNT]: {
    message: '충전 금액은 0보다 커야 합니다.',
    state: 400,
  },
} as const;
