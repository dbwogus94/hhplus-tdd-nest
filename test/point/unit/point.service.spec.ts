import { faker } from '@faker-js/faker';
import { type MockProxy, mock } from 'jest-mock-extended';

import { PointHistoryTable } from 'src/database/pointhistory.table';
import { UserPointTable } from 'src/database/userpoint.table';
import { GetPointHistoryResponse, GetUserPointResponse } from 'src/point/dto';
import {
  InvalidPointAmountException,
  InvalidUserIdException,
} from 'src/point/exception';
import {
  PointHistory,
  TransactionType,
  UserPoint,
} from 'src/point/point.model';
import { PointService } from 'src/point/point.service';

describe('PointService', () => {
  let userDb: MockProxy<UserPointTable>;
  let historyDb: MockProxy<PointHistoryTable>;
  let service: PointService;

  beforeEach(() => {
    userDb = mock<UserPointTable>();
    historyDb = mock<PointHistoryTable>();
    service = new PointService(userDb, historyDb);
  });

  /**
   * 특정 유저의 포인트를 조회합니다.
   * ### TC
   * 1. 성공
   * - 유저의 현재 포인트를 조회한다.
   * 2. 실패
   * - `userId`가 양수가 아니라면 실패한다.
   */
  describe('getPoint', () => {
    describe('실패한다.', () => {
      it('`userId`가 양수가 아니라면 실패한다.', () => {
        // given
        const userId = -6;
        const success = InvalidUserIdException;

        // when
        const result = service.getPoint(userId);
        // then
        expect(result).rejects.toBeInstanceOf(success);
      });
    });

    describe('성공한다.', () => {
      it('`userId` 유효하면 포인트 조회에 성공한다.', async () => {
        // given
        const userId = 1;
        const resultMockPoint: UserPoint = {
          id: 1,
          point: 1000,
          updateMillis: Date.now(),
        };
        const success = GetUserPointResponse.of(resultMockPoint);

        // mocking
        userDb.selectById.mockResolvedValue(resultMockPoint);

        // when
        const result = await service.getPoint(userId);

        // then
        expect(result.id).toBe(success.id);
        expect(result.point).toBe(success.point);
      });
    });
  });

  /**
   * 특정 유저의 포인트 충전/이용 내역을 조회합니다.
   * ### TC
   * 1. 성공
   * - 포인트 충전/이용 내역이을 응답한다.
   * - 포인트 충전/이용 내역이 없는 유저라면 빈 배열을 응답한다.
   * 2. 실패
   * - `userId`가 양수가 아니라면 실패한다.
   */
  describe('getHistories', () => {
    describe('실패한다.', () => {
      it('`userId`가 양수가 아니라면 실패한다.', () => {
        // given
        const userId = -6;
        const success = InvalidUserIdException;

        // when
        const result = service.getHistories(userId);
        // then
        expect(result).rejects.toBeInstanceOf(success);
      });
    });

    describe('성공한다.', () => {
      it('`userId` 유효하면 포인트 히스토리 내역을 리턴한다.', async () => {
        // given
        const userId = 1;
        const resultMockPointHistories: PointHistory[] =
          createPointHistories(userId);
        const success = GetPointHistoryResponse.of(resultMockPointHistories);

        // mocking
        historyDb.selectAllByUserId.mockResolvedValue(resultMockPointHistories);

        // when
        const results = await service.getHistories(userId);
        // then
        expect(results.at(0)).toBeInstanceOf(GetPointHistoryResponse);
        expect(results.length).toBe(success.length);
      });

      it('포인트 히스토리는 내역이 존재하지 않으면 빈배열을 응답한다.', async () => {
        // given
        const userId = 1;
        const pointhistories = [];
        const success = GetPointHistoryResponse.of(pointhistories);

        // mocking
        historyDb.selectAllByUserId.mockResolvedValue(pointhistories);

        // when
        const results = await service.getHistories(userId);
        // then
        expect(results.length).toBe(success.length);
      });
    });
  });

  /**
   * 특정 유저의 포인트를 충전합니다.
   * ### TC
   * 1. 성공
   * 2. 실패
   * - `userId`가 양수가 아니라면 실패한다.
   * - `pointDto.amount`가 양의 정수가 아니라면 실패한다.
   */
  describe('charge', () => {
    describe('실패한다.', () => {
      it('`userId`가 양수가 아니라면 실패한다.', () => {
        // given
        const userId = -1;
        const pointDto = { amount: 1000 };
        const success = InvalidUserIdException;

        // when
        const promiseResult = service.charge(userId, pointDto);
        // then
        expect(promiseResult).rejects.toBeInstanceOf(success);
      });

      it('충전하려는 포인트가 양수가 아니라면 실패한다.', () => {
        // given
        const userId = 1;
        const pointDto = { amount: -1000 };
        const success = InvalidPointAmountException;

        // when
        const promiseResult = service.charge(userId, pointDto);
        // then
        expect(promiseResult).rejects.toBeInstanceOf(success);
      });
    });

    describe('성공한다.', () => {
      it('포인트 충전에 성공한다.', async () => {
        // given
        const userId = 1;
        const chargeAmount = 1000;
        const resultMockUserPoint: UserPoint = {
          id: userId,
          point: chargeAmount,
          updateMillis: Date.now(),
        };
        const success = GetUserPointResponse.of(resultMockUserPoint);

        // mocking
        historyDb.insert.mockResolvedValue({
          id: 1,
          userId: userId,
          type: TransactionType.CHARGE,
          amount: chargeAmount,
          timeMillis: Date.now(),
        });
        userDb.selectById.mockResolvedValue({
          id: userId,
          point: 0,
          updateMillis: Date.now(),
        });
        userDb.insertOrUpdate.mockResolvedValue(resultMockUserPoint);

        // when
        const result = await service.charge(userId, { amount: chargeAmount });
        // then
        expect(result).toEqual(success);
        expect(result.point).toBe(success.point);
      });
    });
  });

  describe('use', () => {});
});

function createPointHistories(
  userId: number,
  options: { length: number } = { length: 3 },
): PointHistory[] {
  const randomPoint = () =>
    faker.number.int({ min: 100, max: 1000, multipleOf: 100 });

  return Array.from({ length: options.length }).map((_, i) => ({
    id: i + 1,
    userId,
    type: i % 2 === 0 ? TransactionType.CHARGE : TransactionType.USE,
    amount: randomPoint(),
    timeMillis: Date.now(),
  }));
}
