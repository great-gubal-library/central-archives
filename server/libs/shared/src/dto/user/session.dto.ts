import { Role } from "../../enums/role.enum";

export interface SessionDto {
	id: number,
	role: Role,
	character: {
		id: number,
		lodestoneId: number,
		name: string,
		server: string,
	}
}
