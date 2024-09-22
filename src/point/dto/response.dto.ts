import { PointHistory, TransactionType, UserPoint } from '../point.model';

/**
 * 유저 포인트 조회 응답 객체
 */
export class GetUserPointResponse
  implements Pick<UserPoint, 'id' | 'point' | 'updateMillis'>
{
  constructor(
    readonly id: number,
    readonly point: number,
    readonly updateMillis: number,
  ) {}
}

/**
 * 포인트 히스토리 조회 응답 객체
 */
export class GetPointHistoryResponse
  implements
    Pick<PointHistory, 'id' | 'userId' | 'type' | 'amount' | 'timeMillis'>
{
  constructor(
    readonly id: number,
    readonly userId: number,
    readonly type: TransactionType,
    readonly amount: number,
    readonly timeMillis: number,
  ) {}
}
