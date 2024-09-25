import { PointHistoryTable } from 'src/database/pointhistory.table';
import { UserPointTable } from 'src/database/userpoint.table';

import {
  PointRepository,
  PointRepositoryPort,
} from 'src/point/point.repository';
import { PointService } from 'src/point/point.service';

describe('PointService - integration TEST', () => {
  let userDb: UserPointTable;
  let historyDb: PointHistoryTable;
  let pointRepo: PointRepositoryPort;
  let service: PointService;

  beforeEach(() => {
    userDb = new UserPointTable();
    historyDb = new PointHistoryTable();
    pointRepo = new PointRepository(userDb, historyDb);
    service = new PointService(pointRepo);
  });

  /**
   * 포인트 충전 동시성 테스트
   * ### TC
   * 1. 성공
   * - 같은 유저에게 동시에 충전 요청이 들어왔을때 최대 충전 금액을 넘는다면, 최대 충전 금액이 넘기전 요청까지만 성공한다.
   * 2. 실패
   * - 같은 유저에게 동시에 충전 요청이 들어왔을때 최대 충전 금액을 넘으면 실패한다.
   */
  describe('포인트 충전 동시성 테스트', () => {
    describe('성공한다.', () => {
      it('같은 유저에게 동시에 충전 요청이 들어왔을때 최대 충전 금액을 넘는다면, 최대 충전 금액이 넘기전 요청까지만 성공한다.', async () => {
        // given
        // when
        // then
      });
    });

    describe('실패한다.', () => {
      it('같은 유저에게 동시에 충전 요청이 들어왔을때 최대 충전 금액을 넘으면 실패한다.', async () => {
        // given
        // when
        // then
      });
    });
  });

  /**
   * 포인트 사용 동시성 테스트
   * ### TC
   * 1. 성공
   * - 같은 유저에게 동시에 사용 요청이 들어왔을때, 잔액이 최소 금액 보다 적게 남았다면, 적게 남기전 요청까지만 성공한다.
   * 2. 실패
   * - 같은 유저에게 동시에 사용 요청이 들어왔을때 최소 충전 금액보다 작으면 실패한다.
   */
  describe('포인트 사용 동시성 테스트', () => {
    describe('성공한다.', () => {
      it('같은 유저에게 동시에 사용 요청이 들어왔을때, 잔액이 최소 금액 보다 적게 남았다면, 적게 남기전 요청까지만 성공한다.', async () => {
        // given
        // when
        // then
      });
    });

    describe('실패한다.', () => {
      it('같은 유저에게 동시에 사용 요청이 들어왔을때 최소 충전 금액보다 작으면 실패한다.', async () => {
        // given
        // when
        // then
      });
    });
  });

  /**
   * 포인트 충전과 사용 동시성 테스트
   * ### TC
   * 성공
   * - 같은 유저가 거의 동시에 순차적으로 [700원 충전 > 1000원 충전 > 400원 사용 요청 > 300원 사용 요청] 하면 포인트는 1000원이 남는다.
   * - 같은 유저가 거의 동시에 순차적으로 [700원 충전 > 1000원 충전 > 400원 사용 요청 > 300원 사용 요청] 하면 포인트 내역은 순서대로 나와야 한다.
   */
  describe('포인트 충전과 사용 동시성 테스트', () => {
    describe('성공한다.', () => {
      it('같은 유저가 거의 동시에 순차적으로 [700원 충전 > 1000원 충전 > 400원 사용 요청 > 300원 사용 요청] 하면 포인트는 1000원이 남는다.', async () => {
        // given
        // when
        // then
      });

      it('같은 유저가 거의 동시에 순차적으로 [700원 충전 > 1000원 충전 > 400원 사용 요청 > 300원 사용 요청] 하면 포인트 내역은 순서대로 나와야 한다.', async () => {
        // given
        // when
        // then
      });
    });
  });
});

// function createPointHistories(
//   userId: number,
//   options: { length: number } = { length: 3 },
// ): PointHistory[] {
//   const randomPoint = () =>
//     faker.number.int({ min: 100, max: 1000, multipleOf: 100 });

//   return Array.from({ length: options.length }).map((_, i) => ({
//     id: i + 1,
//     userId,
//     type: i % 2 === 0 ? TransactionType.CHARGE : TransactionType.USE,
//     amount: randomPoint(),
//     timeMillis: Date.now(),
//   }));
// }
