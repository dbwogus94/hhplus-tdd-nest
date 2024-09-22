import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PointService, PointServiceUseCase } from './point.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
  providers: [{ provide: PointServiceUseCase, useClass: PointService }],
})
export class PointModule {}
