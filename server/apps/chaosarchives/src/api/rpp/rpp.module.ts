import { AuthModule } from "@app/auth/auth.module";
import { Module } from "@nestjs/common";
import { RppController } from "./rpp.controller";

@Module({
	imports: [
    AuthModule,
	],
	controllers: [ RppController ],
})
export class RppModule {}
