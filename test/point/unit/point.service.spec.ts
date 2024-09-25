import { faker } from '@faker-js/faker';
import { type MockProxy, mock } from 'jest-mock-extended';

import { PointHistoryTable } from 'src/database/pointhistory.table';
import { UserPointTable } from 'src/database/userpoint.table';
import { GetPointHistoryResponse } from 'src/point/dto';
import { InvalidUserIdException } from 'src/point/exception';
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
   *
   * ### 행동 분석
   * 1. HTTP URL Path를 통해 id(userId)를 넘겨 받는다.
   * 2. id를 검증한다.
   * 3. 유저의 포인트 현재 포인트를 조회한다.
   * 4. 결과에 맞게 반환한다.
   *
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

        // when
        const result = service.getPoint(userId);

        // then
        expect(result).rejects.toBeInstanceOf(InvalidUserIdException);
      });
    });

    describe('성공한다.', () => {
      it('`userId` 유효하면 포인트 조회에 성공한다.', async () => {
        // given
        const userId = 1;
        const userPoint: UserPoint = {
          id: 1,
          point: 1000,
          updateMillis: Date.now(),
        };

        // mocking
        userDb.selectById.mockResolvedValue(userPoint);

        // when
        const result = await service.getPoint(userId);

        // then
        expect(result.id).toBe(userPoint.id);
        expect(result.point).toBe(userPoint.point);
      });
    });
  });

  /**
   * 특정 유저의 포인트 충전/이용 내역을 조회합니다.
   *
   * ### 행동 분석
   * 1. HTTP URL Path를 통해 id(userId)를 넘겨 받는다.
   * 2. id를 검증한다.
   * 3. 유저의 포인트 충전/이용 내역을 조회한다.
   * 4. 결과에 맞게 반환한다.
   *
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

        // when
        const result = service.getHistories(userId);

        // then
        expect(result).rejects.toBeInstanceOf(InvalidUserIdException);
      });
    });

    describe('성공한다.', () => {
      it('`userId` 유효하면 포인트 히스토리 내역을 리턴한다.', async () => {
        // given
        const userId = 1;
        const pointhistories = GetPointHistoryResponse.of(
          createPointHistories(userId),
        );
        const success = pointhistories.length;

        // mocking
        historyDb.selectAllByUserId.mockResolvedValue(
          GetPointHistoryResponse.of(pointhistories),
        );

        // when
        const results = await service.getHistories(userId);
        // then
        expect(results.length).toBe(success);
      });

      it('포인트 히스토리는 내역이 존재하지 않으면 빈배열을 응답한다.', async () => {
        // given
        const userId = 1;
        const pointhistories = [];
        const success = 0;

        // mocking
        historyDb.selectAllByUserId.mockResolvedValue(
          GetPointHistoryResponse.of(pointhistories),
        );

        // when
        const results = await service.getHistories(userId);
        // then
        expect(results.length).toBe(success);
      });
    });
  });

  // describe('charge', () => {});

  // describe('use', () => {});
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
