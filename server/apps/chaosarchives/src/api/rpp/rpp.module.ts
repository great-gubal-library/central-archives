import { AuthorizationModule } from "@app/authorization/authorization.module";
import { Character } from "@app/entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RppController } from "./rpp.controller";
import { RppService } from "./rpp.service";
import { serverConfiguration } from "@app/configuration";
import { AuthenticationModule } from "libs/authentication/src/authentication.module";

@Module(serverConfiguration.apis.rpp ? {
	imports: [
		TypeOrmModule.forFeature([ Character ]),
    AuthenticationModule,
    AuthorizationModule,
	],
	controllers: [ RppController ],
	providers: [ RppService ],
} : {})
export class RppModule {}
