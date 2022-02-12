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
}
