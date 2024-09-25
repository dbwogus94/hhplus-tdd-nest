import { Injectable } from '@nestjs/common';

import { PointHistoryTable } from 'src/database/pointhistory.table';
import { UserPointTable } from 'src/database/userpoint.table';
import {
  GetPointHistoryResponse,
  GetUserPointResponse,
  PatchPointRequest,
} from './dto';
import {
  InvalidPointAmountException,
  InvalidUserIdException,
} from './exception';

import { TransactionType } from './point.model';

/*
  TODO: 리펙터링
  1. userId 검증은 어떻게 할까? 
    - 그냥 컨트롤러 Pipe로 해결
    - param Valdate 정의?
    - 
*/

export abstract class PointServiceUseCase {
  /**
   * 특정 유저의 포인트를 조회합니다.
   * @param userId
   */
  abstract getPoint(userId: number): Promise<GetUserPointResponse>;

  /**
   * 특정 유저의 포인트 충전/이용 내역을 조회합니다.
   * @param userId
   */
  abstract getHistories(userId: number): Promise<GetPointHistoryResponse[]>;

  /**
   * 특정 유저의 포인트를 충전합니다.
   * TODO: 동시성에 대한 처리가 필요하다.
   *
   * ### 행동분석
   * 1. 포인트 충전 파라미터(userId와 충전 금액)를 넘겨 받는다.
   * 2. 포인트 충전 파라미터를 검증한다.
   *   - `UserPointTable#selectById` 로직에 의해 유저가 존재하지 않는 경우는 생략한다.
   * 3. 유저의 현재 포인트를 조회한다.
   * 4. 조회된 현재 포인트에 충전된 금액을 더해 저장한다.
   * 5. 포인트 histories에 충전된 내역을 추가한다.
   * 6. 현재 포인트를 반환한다.
   *
   * ### TC
   * 1. 성공
   * 2. 실패
   * - `userId`가 존재하지 않으면(null이거나 undefined) 실패힌다.
   * - `userId`가 양의 정수가 아니라면 실패한다.
   * - `pointDto.amount`가 존재하지 않으면(null이거나 undefined) 실패힌다.
   * - `pointDto.amount`가 양의 정수가 아니라면 실패한다.
   *
   * @param userId
   * @param pointDto
   */
  abstract charge(
    userId: number,
    pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse>;

  /**
   * 특정 유저의 포인트를 사용합니다.
   * TODO: 동시성에 대한 처리가 필요하다.
   *
   * ### 행동분석
   * 1. 포인트 사용 파라미터(userId와 충전 금액)를 넘겨 받는다.
   * 2. 포인트 사용 파라미터를 검증한다.
   *   - `UserPointTable#selectById` 로직에 의해 유저가 존재하지 않는 경우는 생략한다.
   * 3. 유저의 현재 포인트를 조회한다.
   * 4. 조회된 현재 포인트에 사용될 금액을 차감해 저장한다.
   * 5. 포인트 histories에 사용된 내역을 추가한다.
   * 6. 현재 포인트를 반환한다.
   *
   * ### TC
   * 1. 성공
   * 2. 실패
   * - `userId`가 존재하지 않으면(null이거나 undefined) 실패힌다.
   * - `userId`가 양의 정수가 아니라면 실패한다.
   * - `pointDto.amount`가 존재하지 않으면(null이거나 undefined) 실패힌다.
   * - `pointDto.amount`가 양의 정수가 아니라면 실패한다.
   * @param userId
   * @param pointDto
   */
  abstract use(
    userId: number,
    pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse>;
}

@Injectable()
export class PointService extends PointServiceUseCase {
  readonly list = {};

  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {
    super();
  }

  override async getPoint(userId: number): Promise<GetUserPointResponse> {
    if (userId < 0) throw new InvalidUserIdException();

    const userPoint = await this.userDb.selectById(userId);
    return GetUserPointResponse.of(userPoint);
  }

  override async getHistories(
    userId: number,
  ): Promise<GetPointHistoryResponse[]> {
    if (userId < 0) throw new InvalidUserIdException();

    const histories = await this.historyDb.selectAllByUserId(userId);
    return GetPointHistoryResponse.of(histories);
  }

  override async charge(
    userId: number,
    pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    if (userId < 0) throw new InvalidUserIdException();
    if (pointDto.amount < 0) throw new InvalidPointAmountException();

    await this.historyDb.insert(
      userId,
      pointDto.amount,
      TransactionType.CHARGE,
      Date.now(),
    );

    const userPoint = await this.userDb.selectById(userId);
    const updatePoint = userPoint.point + pointDto.amount;
    const result = await this.userDb.insertOrUpdate(userId, updatePoint);
    return GetUserPointResponse.of(result);
  }

  override async use(
    userId: number,
    pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    throw new Error('Method not implemented.');
  }
}
