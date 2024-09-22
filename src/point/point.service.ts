import { Injectable } from '@nestjs/common';

import { PointHistoryTable } from 'src/database/pointhistory.table';
import { UserPointTable } from 'src/database/userpoint.table';
import {
  GetUserPointResponse,
  GetPointHistoryResponse,
  PatchPointRequest,
} from './dto';

export abstract class PointServiceUseCase {
  /**
   * 특정 유저의 포인트를 조회합니다.
   *
   * ### 행동 분석
   * 1. HTTP URL Path를 통해 id(userId)를 넘겨 받는다.
   * 2. id를 검증한다.
   * 3. 유저의 포인트 현재 포인트를 조회한다.
   *   - `UserPointTable#selectById` 로직에 의해 유저가 존재하지 않는 경우는 생략한다.
   * 4. 결과에 맞게 반환한다.
   *
   * ### TC
   * 1. 성공
   * - 유저의 현재 포인트를 조회한다.
   * - 최초에 유저의 포인트가 없다면 포인트는 0을 응답한다.
   * 2. 실패
   * - `userId`가 존재하지 않으면(null이거나 undefined) 실패힌다.
   * - `userId`가 양의 정수가 아니라면 조회에 실패한다.
   * @param userId
   */
  abstract getPoint(userId: number): Promise<GetUserPointResponse>;

  /**
   * 특정 유저의 포인트 충전/이용 내역을 조회합니다.
   *
   * ### 행동 분석
   * 1. HTTP URL Path를 통해 id(userId)를 넘겨 받는다.
   * 2. id를 검증한다.
   *   - `UserPointTable#selectById` 로직에 의해 유저가 존재하지 않는 경우는 생략한다.
   * 3. 유저의 포인트 충전/이용 내역을 조회한다.
   * 4. 결과에 맞게 반환한다.
   *
   * ### TC
   * 1. 성공
   * - 포인트 충전/이용 내역이을 응답한다.
   * - 포인트 충전/이용 내역이 없는 유저라면 빈 배열을 응답한다.
   * 2. 실패
   * - `userId`가 존재하지 않으면(null이거나 undefined) 실패힌다.
   * - `userId`가 양의 정수가 아니라면 조회에 실패한다.
   * @param userId
   */
  abstract getHistory(userId: number): Promise<GetPointHistoryResponse[]>;

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
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {
    super();
  }

  override async getPoint(userId: number): Promise<GetUserPointResponse> {
    throw new Error('Method not implemented.');
  }

  override async getHistory(
    userId: number,
  ): Promise<GetPointHistoryResponse[]> {
    throw new Error('Method not implemented.');
  }

  override async charge(
    userId: number,
    pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    throw new Error('Method not implemented.');
  }

  override async use(
    userId: number,
    pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    throw new Error('Method not implemented.');
  }
}
