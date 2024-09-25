import {
  Body,
  Controller,
  Get,
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
    return await this.pointService.getHistories(userId);
  }

  @Patch(':id/charge')
  async charge(
    @Param('id', ParseIntPipe) userId: number,
    @Body(ValidationPipe) pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    return await this.pointService.charge(userId, pointDto);
  }

  @Patch(':id/use')
  async use(
    @Param('id', ParseIntPipe) userId: number,
    @Body(ValidationPipe) pointDto: PatchPointRequest,
  ): Promise<GetUserPointResponse> {
    return await this.pointService.use(userId, pointDto);
  }
}
