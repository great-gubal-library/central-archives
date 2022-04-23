import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { UserInfo } from '@app/auth/model/user-info';
import { ViolationReportDto } from '@app/shared/dto/violations/violation-report.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Post } from '@nestjs/common';
import { ViolationsService } from './violations.service';

@Controller('violations')
export class ViolationsController {
	constructor(private violationsService: ViolationsService) {}

	@Post()
	@RoleRequired(Role.USER)
	async reportViolation(@Body() report: ViolationReportDto, @CurrentUser() user: UserInfo): Promise<void> {
		await this.violationsService.reportViolation(report, user);
	}
}
