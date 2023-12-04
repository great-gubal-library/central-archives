import { Module } from "@nestjs/common";
import { LodestoneService } from "./lodestone.service";
import { LodestoneController } from "./lodestone.controller";

@Module({
  controllers: [ LodestoneController ],
  providers: [ LodestoneService ],
  exports: [ LodestoneService ],
})
export class LodestoneModule {

}
