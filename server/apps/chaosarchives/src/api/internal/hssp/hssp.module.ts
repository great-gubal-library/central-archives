import { Module } from '@nestjs/common';
import { HsspController } from './hssp.controller';
import { HsspService } from './hssp.service';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [ AuthModule ],
  controllers: [ HsspController ],
  providers: [ HsspService ],
})
export class HsspModule {}
