import { Injectable } from '@nestjs/common';

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
import { PointRepositoryPort } from './point.repository';

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
  constructor(private readonly pointRepo: PointRepositoryPort) {
    super();
  }

  override async getPoint(userId: number): Promise<GetUserPointResponse> {
    if (userId < 0) throw new InvalidUserIdException();

    const userPoint = await this.pointRepo.findPointBy(userId);
    return GetUserPointResponse.of(userPoint);
  }

  override async getHistories(
    userId: number,
  ): Promise<GetPointHistoryResponse[]> {
    if (userId < 0) throw new InvalidUserIdException();
    const histories = await this.pointRepo.findHistoriesBy(userId);
    return GetPointHistoryResponse.of(histories);
  }

  override async charge(
    userId: number,
    pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    if (userId < 0) throw new InvalidUserIdException();
    if (pointDto.amount < 0) throw new InvalidPointAmountException();

    const { point: currantPoint } = await this.pointRepo.findPointBy(userId);
    const result = await this.pointRepo.insertPointWithTransaction(userId, {
      point: currantPoint + pointDto.amount,
      amount: pointDto.amount,
      type: TransactionType.CHARGE,
    });
    return GetUserPointResponse.of(result);
  }

  override async use(
    userId: number,
    pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    if (userId < 0) throw new InvalidUserIdException();
    if (pointDto.amount < 0) throw new InvalidPointAmountException();

    const { point: currantPoint } = await this.pointRepo.findPointBy(userId);
    const result = await this.pointRepo.insertPointWithTransaction(userId, {
      point: currantPoint - pointDto.amount,
      amount: pointDto.amount,
      type: TransactionType.USE,
    });
    return GetUserPointResponse.of(result);
  }
}
