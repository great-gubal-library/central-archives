import { IsBoolean } from "class-validator";

export class MemberFlagsDto {
	@IsBoolean()
	canEdit: boolean;

	@IsBoolean()
	canManageMembers: boolean;
	
	constructor(properties?: Readonly<MemberFlagsDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
