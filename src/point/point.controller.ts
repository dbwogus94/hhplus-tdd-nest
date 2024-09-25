import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  ValidationPipe,
} from '@nestjs/common';

import {
  GetPointHistoryResponse,
  GetUserPointResponse,
  PatchPointRequest,
} from './dto';
import { PointServiceUseCase } from './point.service';

@Controller('/point')
export class PointController {
  constructor(private readonly pointService: PointServiceUseCase) {}

  @Get(':id')
  async point(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<GetUserPointResponse> {
    return await this.pointService.getPoint(userId);
  }

  @Get(':id/histories')
  async history(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<GetPointHistoryResponse[]> {
    return await this.pointService.getHistory(userId);
  }

  /**
   * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   */
  @Patch(':id/charge')
  async charge(
    @Param('id', ParseIntPipe) userId: number,
    @Body(ValidationPipe) pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    const amount = pointDto.amount;

    // return { id: userId, point: amount, updateMillis: Date.now() };
    throw new NotFoundException('미구현 API 입니다.');
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  async use(
    @Param('id', ParseIntPipe) userId: number,
    @Body(ValidationPipe) pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    const amount = pointDto.amount;
    // return { id: userId, point: amount, updateMillis: Date.now() };
    throw new NotFoundException('미구현 API 입니다.');
  }
}
