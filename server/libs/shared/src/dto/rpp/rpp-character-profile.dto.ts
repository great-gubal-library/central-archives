import { IsString } from "class-validator";
import { BaseCharacterProfileDto } from "../characters/base-character-profile.dto";

export class RppCharacterProfileDto extends BaseCharacterProfileDto {
	constructor(properties?: Readonly<RppCharacterProfileDto>) {
    super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
