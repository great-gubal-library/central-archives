import { Module } from '@nestjs/common';
import { ViolationsController } from './violations.controller';
import { ViolationsService } from './violations.service';

@Module({
  controllers: [ViolationsController],
  providers: [ViolationsService]
})
export class ViolationsModule {}
