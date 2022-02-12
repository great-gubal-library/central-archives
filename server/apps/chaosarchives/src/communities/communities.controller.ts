import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { CommunitySummaryDto } from '@app/shared/dto/communities/community-summary.dto';
import { CommunityDto } from '@app/shared/dto/communities/community.dto';
import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { CommunitiesService } from './communities.service';

@Controller('communities')
export class CommunitiesController {
	constructor(private communitiesService: CommunitiesService) {}

	@Get('my-communities')
	@RoleRequired(Role.USER)
	async getMyCommunities(@Query('characterId', ParseIntPipe) characterId: number, @CurrentUser() user: UserInfo): Promise<MyCommunitySummaryDto[]> {
		return this.communitiesService.getMyCommunities(characterId, user);
	}

	@Get()
	async getCommunities(): Promise<CommunitySummaryDto[]> {
		return this.communitiesService.getCommunities({}, false);
	}

	@Get(':id')
	@UseGuards(OptionalJwtAuthGuard)
	async getCommunity(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: UserInfo): Promise<CommunityDto> {
		return this.communitiesService.getCommunity(id, user);
	}
}
