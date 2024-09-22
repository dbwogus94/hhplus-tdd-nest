import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';

import { PointServiceUseCase } from './point.service';
import {
  GetUserPointResponse,
  GetPointHistoryResponse,
  PatchPointRequest,
} from './dto';

@Controller('/point')
export class PointController {
  constructor(private readonly pointService: PointServiceUseCase) {}

  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param('id') id): Promise<GetUserPointResponse> {
    const userId = Number.parseInt(id);
    return { id: userId, point: 0, updateMillis: Date.now() };
  }

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(@Param('id') id): Promise<GetPointHistoryResponse[]> {
    const userId = Number.parseInt(id);
    // return [];
    throw new NotFoundException('미구현 API 입니다.');
  }

  /**
   * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   */
  @Patch(':id/charge')
  async charge(
    @Param('id') id,
    @Body(ValidationPipe) pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    const userId = Number.parseInt(id);
    const amount = pointDto.amount;

    // return { id: userId, point: amount, updateMillis: Date.now() };
    throw new NotFoundException('미구현 API 입니다.');
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  async use(
    @Param('id') id,
    @Body(ValidationPipe) pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    const userId = Number.parseInt(id);
    const amount = pointDto.amount;
    // return { id: userId, point: amount, updateMillis: Date.now() };
    throw new NotFoundException('미구현 API 입니다.');
  }
}
