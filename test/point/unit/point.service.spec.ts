import { type MockProxy, mock } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';

import { PointService } from 'src/point/point.service';
import { UserPointTable } from 'src/database/userpoint.table';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import {
  PointHistory,
  TransactionType,
  UserPoint,
} from 'src/point/point.model';
import { BadRequestException } from '@nestjs/common';
import { GetPointHistoryResponse } from 'src/point/dto';

describe('PointService', () => {
  let userDb: MockProxy<UserPointTable>;
  let historyDb: MockProxy<PointHistoryTable>;
  let service: PointService;

  beforeEach(() => {
    userDb = mock<UserPointTable>();
    historyDb = mock<PointHistoryTable>();
    service = new PointService(userDb, historyDb);
  });

  /** 현재 포인트 조회 */
  describe('getPoint', () => {
    it('`userId`가 존재하지 않으면(null이거나 undefined) 실패한다.', () => {
      // given
      const userId = null;

      // when
      const result = service.getPoint(userId);

      // then
      expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(result).rejects.toThrow('userId 필수 입니다.');
    });

    it('`userId`가 숫자나 숫자형 문자열이 아니면 실패한다.', () => {
      // given
      const userId = NaN;

      // when
      service.getPoint(userId).catch((error) => {
        // then
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('userId는 숫자형만 가능합니다.');
      });
    });

    it('`userId`가 양의 정수가 아니라면 실패한다.', async () => {
      // given
      const userId = -6;

      try {
        // when
        await service.getPoint(userId);
      } catch (error) {
        // then
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('userId는 양의 정수만 가능 합니다.');
      }
    });

    it('`(성공) userId`가 1인 유저의 현재 포인트는 1000원이다.', async () => {
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

  /** 포인트 히스토리 조회 */
  describe('getHistory', () => {
    it('`userId`가 존재하지 않으면(null이거나 undefined) 실패한다.', () => {
      // given
      const userId = null;

      // when
      const result = service.getHistory(userId);

      // then
      expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(result).rejects.toThrow('userId 필수 입니다.');
    });

    it('`userId`가 숫자나 숫자형 문자열이 아니면 실패한다.', () => {
      // given
      const userId = NaN;

      // when
      const result = service.getHistory(userId);

      // then
      expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(result).rejects.toThrow('userId는 숫자형만 가능합니다.');
    });

    it('`userId`가 양의 정수가 아니라면 실패한다.', () => {
      // given
      const userId = -6;

      // when
      const result = service.getHistory(userId);

      // then
      expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(result).rejects.toThrow('userId는 양의 정수만 가능 합니다.');
    });

    it('(성공) userId`가 1인 유저의 포인트 히스토리는 3개가 존재한다.', async () => {
      // given
      const userId = 1;
      const pointhistories = GetPointHistoryResponse.of(
        createPointHistories(userId),
      );
      // mocking
      historyDb.selectAllByUserId.mockResolvedValue(
        GetPointHistoryResponse.of(pointhistories),
      );

      // when
      const results = await service.getHistory(userId);
      // then
      expect(results.length).toBe(3);
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
