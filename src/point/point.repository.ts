import { PointHistoryTable } from 'src/database/pointhistory.table';
import { UserPointTable } from 'src/database/userpoint.table';
import { PointHistory, UserPoint } from './point.model';
import { Injectable } from '@nestjs/common';

type InsertPointBody = Pick<PointHistory, 'amount' | 'type'> & {
  point: number;
};

export abstract class PointRepositoryPort {
  abstract findPointBy(userId: number): Promise<UserPoint>;

  abstract findHistoriesBy(userId: number): Promise<PointHistory[]>;

  /**
   * 포인트 생성 트랜잭션
   * - PointHistory를 생성한다.
   * - UserPoint를 최신화 한다.
   * @param userId
   * @param body
   */
  abstract insertPointWithTransaction(
    userId: number,
    body: InsertPointBody,
  ): Promise<UserPoint>;
}

@Injectable()
export class PointRepository extends PointRepositoryPort {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {
    super();
  }

  override async findPointBy(userId: number): Promise<UserPoint> {
    return await this.userDb.selectById(userId);
  }

  override async findHistoriesBy(userId: number): Promise<PointHistory[]> {
    return await this.historyDb.selectAllByUserId(userId);
  }

  override async insertPointWithTransaction(
    userId: number,
    body: InsertPointBody,
  ): Promise<UserPoint> {
    const { point, amount, type } = body;
    await this.historyDb.insert(userId, amount, type, Date.now());
    return await this.userDb.insertOrUpdate(userId, point);
  }
}
