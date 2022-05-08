import { AuthModule } from "@app/auth/auth.module";
import { Character } from "@app/entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RppController } from "./rpp.controller";
import { RppService } from "./rpp.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([ Character ]),
    AuthModule,
	],
	controllers: [ RppController ],
	providers: [ RppService ],
})
export class RppModule {}
