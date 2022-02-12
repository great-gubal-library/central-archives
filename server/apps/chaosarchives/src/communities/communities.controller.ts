import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { UserInfo } from '@app/auth/model/user-info';
import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { CommunitiesService } from './communities.service';

@Controller('communities')
export class CommunitiesController {
	constructor(private communitiesService: CommunitiesService) {}

	@Get('my-communities')
	@RoleRequired(Role.USER)
	async getMyCommunities(@Query('characterId', ParseIntPipe) characterId: number, @CurrentUser() user: UserInfo): Promise<MyCommunitySummaryDto[]> {
		return this.communitiesService.getMyCommunities(characterId, user);
	}
}
