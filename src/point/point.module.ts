import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { PointController } from './point.controller';
import { PointRepository, PointRepositoryPort } from './point.repository';
import { PointService, PointServiceUseCase } from './point.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
  providers: [
    { provide: PointServiceUseCase, useClass: PointService },
    { provide: PointRepositoryPort, useClass: PointRepository },
  ],
})
export class PointModule {}
