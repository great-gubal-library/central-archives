import { Module } from '@nestjs/common';
import { HsspController } from './hssp.controller';
import { HsspService } from './hssp.service';
import { AuthorizationModule } from '@app/authorization/authorization.module';

@Module({
  imports: [ AuthorizationModule ],
  controllers: [ HsspController ],
  providers: [ HsspService ],
})
export class HsspModule {}
