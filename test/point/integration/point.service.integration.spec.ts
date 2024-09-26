import { PointHistoryTable } from 'src/database/pointhistory.table';
import { UserPointTable } from 'src/database/userpoint.table';
import { ConflictPointOperationException } from 'src/point/exception';
import { TransactionType } from 'src/point/point.model';
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
        const userId = 1;
        const points = [{ amount: 10000 }, { amount: 19900 }, { amount: 200 }];
        const success = 29900;

        // when
        try {
          await Promise.all(points.map((p) => service.charge(userId, p)));
        } catch (error) {}

        // then
        const result = await service.getPoint(userId);
        expect(result.point).toBe(success);
      });
    });

    describe('실패한다.', () => {
      it('같은 유저에게 동시에 충전 요청이 들어왔을때 최대 충전 금액을 넘으면 실패한다.', async () => {
        // given
        const userId = 100;
        const points = [
          { amount: 10000 },
          { amount: 10000 },
          { amount: 10000 },
          { amount: 10000 },
        ];
        const success = ConflictPointOperationException;

        // when
        try {
          await Promise.all(points.map((p) => service.charge(userId, p)));
        } catch (error) {
          expect(error).toBeInstanceOf(success);
        }
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
        const userId = 1;
        const defaultChargeAmount = 10000;
        const points = [{ amount: 5000 }, { amount: 4000 }, { amount: 2000 }];
        const success = defaultChargeAmount - 9000;
        await service.charge(userId, { amount: defaultChargeAmount });

        // when
        try {
          await Promise.all(points.map((p) => service.use(userId, p)));
        } catch (error) {}

        // then
        const result = await service.getPoint(userId);
        expect(result.point).toBe(success);
      });
    });

    describe('실패한다.', () => {
      it('같은 유저에게 동시에 사용 요청이 들어왔을때 최소 충전 금액보다 작으면 실패한다.', async () => {
        // given
        const userId = 100;
        const points = [{ amount: 10000 }, { amount: 10000 }, { amount: 100 }];
        const defaultChargeAmount = 20000;
        await service.charge(userId, { amount: defaultChargeAmount });
        const success = ConflictPointOperationException;

        // when
        try {
          await Promise.all(points.map((p) => service.charge(userId, p)));
        } catch (error) {
          expect(error).toBeInstanceOf(success);
        }
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
        const userId = 100;
        const points = [
          { amount: 700, type: TransactionType.CHARGE },
          { amount: 1000, type: TransactionType.CHARGE },
          { amount: 400, type: TransactionType.USE },
          { amount: 300, type: TransactionType.USE },
        ];
        const success = 1000;

        // when
        await Promise.all(
          points.map((p) =>
            p.type === TransactionType.CHARGE
              ? service.charge(userId, p)
              : service.use(userId, p),
          ),
        );

        // then
        const result = await service.getPoint(userId);
        expect(result.point).toBe(success);
      });

      it('같은 유저가 거의 동시에 순차적으로 [700원 충전 > 1000원 충전 > 400원 사용 요청 > 300원 사용 요청] 하면 포인트 내역은 순서대로 나와야 한다.', async () => {
        // given
        const userId = 100;
        const points = [
          { amount: 700, type: TransactionType.CHARGE },
          { amount: 1000, type: TransactionType.CHARGE },
          { amount: 400, type: TransactionType.USE },
          { amount: 300, type: TransactionType.USE },
        ];

        // when
        await Promise.all(
          points.map((p) =>
            p.type === TransactionType.CHARGE
              ? service.charge(userId, p)
              : service.use(userId, p),
          ),
        );

        // then
        const results = await service.getHistories(userId);

        // result
        const resultAmounts = results.map((r) => ({
          amount: r.amount,
          type: r.type,
        }));
        expect(resultAmounts).toEqual(points);
      });

      it('다양한 유저가 동시에 포인트 충전시 에러가 발생해도 다른 요청은 성공해야 한다.', async () => {
        // given
        const points = [
          { id: 1, amount: 4000, type: TransactionType.CHARGE },
          { id: 2, amount: 1000, type: TransactionType.CHARGE },
          { id: 3, amount: 2000, type: TransactionType.CHARGE },
          { id: 1, amount: 100, type: TransactionType.USE },
          { id: 3, amount: 3000, type: TransactionType.USE }, // 에러 발생
          { id: 2, amount: 3000, type: TransactionType.CHARGE },
          { id: 3, amount: 6000, type: TransactionType.USE },
          { id: 1, amount: 500, type: TransactionType.CHARGE },
        ];

        // when
        await Promise.allSettled(
          points.map((p) =>
            p.type === TransactionType.CHARGE
              ? service.charge(p.id, { amount: p.amount })
              : service.use(p.id, { amount: p.amount }),
          ),
        );

        // result
        const user1PointHistories = await service.getHistories(1);
        expect(
          user1PointHistories.map((u) => ({
            id: u.userId,
            amount: u.amount,
            type: u.type,
          })),
        ).toEqual(points.filter((p) => p.id === 1));

        const user2PointHistories = await service.getHistories(2);
        expect(
          user2PointHistories.map((u) => ({
            id: u.userId,
            amount: u.amount,
            type: u.type,
          })),
        ).toEqual(points.filter((p) => p.id === 2));

        const user3PointHistories = await service.getHistories(3);
        expect(
          user3PointHistories.map((u) => ({
            id: u.userId,
            amount: u.amount,
            type: u.type,
          })),
        ).toEqual([{ id: 3, amount: 2000, type: TransactionType.CHARGE }]);
      });
    });
  });
});
