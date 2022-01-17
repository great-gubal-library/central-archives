import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { UserInfo } from '@app/auth/model/user-info';
import { CharacterIdWrapper } from '@app/shared/dto/common/character-id-wrapper.dto';
import { CommunityFCSummaryDto } from '@app/shared/dto/communities/community-fc-summary.dto';
import { MyCommunitiesInfoDto } from '@app/shared/dto/communities/my-communities-info.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommunitiesService } from './communities.service';

@Controller('communities')
export class CommunitiesController {
	constructor(private communitiesService: CommunitiesService) {}

	@Get('my-communities')
	@RoleRequired(Role.USER)
	async getCommunitiesInfo(@Query() characterIdWrapper: CharacterIdWrapper, @CurrentUser() user: UserInfo): Promise<MyCommunitiesInfoDto> {
		return this.communitiesService.getCommunitiesInfo(characterIdWrapper, user);
	}

	@Post('free-company')
	@RoleRequired(Role.USER)
	async setFreeCompany(@Body() characterIdWrapper: CharacterIdWrapper, @CurrentUser() user: UserInfo): Promise<CommunityFCSummaryDto|null> {
		return this.communitiesService.setFreeCompany(characterIdWrapper, user);
	}

	@Post('free-company/unset')
	@RoleRequired(Role.USER)
	async unsetFreeCompany(@Body() characterIdWrapper: CharacterIdWrapper, @CurrentUser() user: UserInfo): Promise<void> {
		await this.communitiesService.unsetFreeCompany(characterIdWrapper, user);
	}
}
