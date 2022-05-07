import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { CharacterIdWrapper } from '@app/shared/dto/common/character-id-wrapper.dto';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { CommunityMemberDto } from '@app/shared/dto/communities/community-member.dto';
import { CommunitySummaryDto } from '@app/shared/dto/communities/community-summary.dto';
import { CommunityDto } from '@app/shared/dto/communities/community.dto';
import { MemberFlagsDto } from '@app/shared/dto/communities/member-flags.dto';
import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { CommunitiesService } from './communities.service';

class OptionalCharacterId {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  characterId?: number;
}

@Controller('communities')
export class CommunitiesController {
  constructor(private communitiesService: CommunitiesService) {}

  @Get('my-communities')
  @RoleRequired(Role.USER)
  async getMyCommunities(
    @Query('characterId', ParseIntPipe) characterId: number,
    @CurrentUser() user: UserInfo,
  ): Promise<MyCommunitySummaryDto[]> {
    return this.communitiesService.getMyCommunities(characterId, user);
  }

  @Get(':id/members')
  @RoleRequired(Role.USER)
  async getCommunityMembers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserInfo,
  ): Promise<CommunityMemberDto[]> {
    return this.communitiesService.getCommunityMembers(id, user);
  }

  @Post(':id/members/apply')
  @RoleRequired(Role.USER)
  async applyForMembership(
    @Param('id', ParseIntPipe) id: number,
    @Body() characterId: CharacterIdWrapper,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.communitiesService.applyForMembership(id, characterId, user);
  }

  @Post(':id/members/approve')
  @RoleRequired(Role.USER)
  async approveMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() characterId: CharacterIdWrapper,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.communitiesService.approveMember(id, characterId, user);
  }

  @Post(':id/members/reject')
  @RoleRequired(Role.USER)
  async rejectMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() characterId: CharacterIdWrapper,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.communitiesService.rejectMember(id, characterId, user);
  }

  @Put(':id/members/:characterId/flags')
  @RoleRequired(Role.USER)
  async setMemberFlags(
    @Param('id', ParseIntPipe) id: number,
		@Param('characterId', ParseIntPipe) characterId: number,
    @Body() flags: MemberFlagsDto,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.communitiesService.setMemberFlags(id, characterId, flags, user);
  }

  @Get()
  async getCommunities(): Promise<CommunitySummaryDto[]> {
    return this.communitiesService.getCommunities({}, false);
  }

  @Get('by-name/:name')
  @UseGuards(OptionalJwtAuthGuard)
  async getCommunityByName(
    @Param('name') name: string,
    @Query() characterId: OptionalCharacterId,
    @CurrentUser() user?: UserInfo,
  ): Promise<CommunityDto> {
    console.log('characterId', characterId);
    return this.communitiesService.getCommunityByName(name, characterId.characterId, user);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Query() characterId: OptionalCharacterId,
    @CurrentUser() user?: UserInfo,
  ): Promise<CommunityDto> {
    return this.communitiesService.getCommunity(id, characterId.characterId, user);
  }

  @Post()
  @RoleRequired(Role.USER)
  async createCommunity(@Body() community: CommunityDto, @CurrentUser() user: UserInfo): Promise<IdWrapper> {
    return this.communitiesService.createCommunity(community, user);
  }

  @Put(':id')
  @RoleRequired(Role.USER)
  async editCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Body() community: CommunityDto,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    // eslint-disable-next-line no-param-reassign
    community.id = id;
    await this.communitiesService.editCommunity(community, user);
  }

  @Delete(':id')
  @RoleRequired(Role.USER)
  async deleteCommunity(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserInfo): Promise<void> {
    return this.communitiesService.deleteCommunity(id, user);
  }
}
