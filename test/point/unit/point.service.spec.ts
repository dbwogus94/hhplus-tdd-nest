import { faker } from '@faker-js/faker';
import { type MockProxy, mock } from 'jest-mock-extended';
import { PointManager } from 'src/point/component';

import { GetPointHistoryResponse, GetUserPointResponse } from 'src/point/dto';
import {
  ConflictPointOperationException,
  InvalidPointAmountException,
  InvalidUserIdException,
} from 'src/point/exception';
import {
  PointHistory,
  TransactionType,
  UserPoint,
} from 'src/point/point.model';
import {
  PointRepository,
  PointRepositoryPort,
} from 'src/point/point.repository';
import { PointService } from 'src/point/point.service';

describe('PointService', () => {
  let pointRepo: MockProxy<PointRepositoryPort>;
  let service: PointService;

  beforeEach(() => {
    pointRepo = mock<PointRepository>();
    service = new PointService(pointRepo);
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
        pointRepo.findPointBy.mockResolvedValue(resultMockPoint);

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
        pointRepo.findHistoriesBy.mockResolvedValue(resultMockPointHistories);

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
        pointRepo.findHistoriesBy.mockResolvedValue(pointhistories);

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
   * - 충전 한도에 초과하면 실패한다.
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
      it('기존 포인트 2000원에 포인트 1000원 충전에 성공한다.', async () => {
        // given
        const userId = 1;
        const defaultPoint = 2000;
        const chargeAmount = 1000;
        const resultMockUserPoint: UserPoint = {
          id: userId,
          point: defaultPoint + chargeAmount,
          updateMillis: Date.now(),
        };
        const success = GetUserPointResponse.of(resultMockUserPoint);

        // mocking
        pointRepo.findPointBy.mockResolvedValue({
          id: userId,
          point: defaultPoint,
          updateMillis: Date.now() - 60000,
        });
        pointRepo.insertPointWithTransaction.mockResolvedValue(
          resultMockUserPoint,
        );

        // when
        const result = await service.charge(userId, { amount: chargeAmount });
        // then
        expect(result).toEqual(success);
        expect(result.point).toBe(success.point);
      });
    });
  });

  /**
   * 특정 유저의 포인트를 사용합니다.
   * ### TC
   * 1. 성공
   * 2. 실패
   * - `userId`가 양수가 아니라면 실패한다.
   * - `pointDto.amount`가 양의 정수가 아니라면 실패한다.
   * - 잔액부족이면 사용에 실패한다.
   */
  describe('use', () => {
    describe('실패한다.', () => {
      it('`userId`가 양수가 아니라면 실패한다.', () => {
        // given
        const userId = -1;
        const pointDto = { amount: 1000 };
        const success = InvalidUserIdException;

        // when
        const promiseResult = service.use(userId, pointDto);
        // then
        expect(promiseResult).rejects.toBeInstanceOf(success);
      });

      it('사용하려는 포인트가 양수가 아니라면 실패한다.', () => {
        // given
        const userId = 1;
        const pointDto = { amount: -1000 };
        const success = InvalidPointAmountException;

        // when
        const promiseResult = service.use(userId, pointDto);
        // then
        expect(promiseResult).rejects.toBeInstanceOf(success);
      });
    });

    describe('성공한다.', () => {
      it('기존 포인트 3000원에 포인트 1000원 사용에 성공한다.', async () => {
        // given
        const userId = 1;
        const defaultPoint = 3000;
        const useAmount = 1000;

        const resultMockUserPoint: UserPoint = {
          id: userId,
          point: defaultPoint - useAmount,
          updateMillis: Date.now(),
        };
        const success = GetUserPointResponse.of(resultMockUserPoint);

        // mocking
        pointRepo.findPointBy.mockResolvedValue({
          id: userId,
          point: defaultPoint,
          updateMillis: Date.now() - 60000,
        });
        pointRepo.insertPointWithTransaction.mockResolvedValue(
          resultMockUserPoint,
        );

        // when
        const result = await service.use(userId, { amount: useAmount });
        // then
        expect(result).toEqual(success);
        expect(result.point).toBe(success.point);
      });
    });
  });
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
