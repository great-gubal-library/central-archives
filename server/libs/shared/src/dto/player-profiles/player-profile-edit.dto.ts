import { playerNameRegex } from "@app/shared/validation/validators";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class PlayerProfileEditDto {
	@IsString()
	@IsNotEmpty()
	@Matches(playerNameRegex)
	name: string;

	@IsString()
	content: string;

	@IsString()
	carrdProfile: string;

	constructor(properties?: Readonly<PlayerProfileEditDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
