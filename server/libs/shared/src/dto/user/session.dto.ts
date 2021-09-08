import { Role } from "@app/shared/enums/role.enum";

export interface SessionDto {
	id: number,
	role: Role,
}
