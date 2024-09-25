import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvertExceptionInterceptor } from './common';
import { PointModule } from './point/point.module';

@Module({
  imports: [PointModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ConvertExceptionInterceptor,
    },
  ],
})
export class AppModule {}
