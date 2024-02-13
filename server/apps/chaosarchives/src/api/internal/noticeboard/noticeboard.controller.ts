import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { NoticeboardItemSummaryDto } from '@app/shared/dto/noticeboard/noticeboard-item-summary.dto';
import { NoticeboardItemDto } from '@app/shared/dto/noticeboard/noticeboard-item.dto';
import { Role } from '@app/shared/enums/role.enum';
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { NoticeboardService } from './noticeboard.service';
import { ClientRegion } from 'apps/chaosarchives/src/common/client-region.decorator';
import { SiteRegion } from '@app/shared/enums/region.enum';

class CreateNoticeboardItemParamDto {
  @IsOptional()
  @Transform((val) => val.value === 'true')
  postOnDiscord?: boolean;
}

@Controller('noticeboard')
export class NoticeboardController {
	constructor(private noticeboardService: NoticeboardService) { }

	@Get(':id')
	@UseGuards(OptionalJwtAuthGuard)
	async getNoticeboardItem(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: UserInfo): Promise<NoticeboardItemDto> {
		return this.noticeboardService.getNoticeboardItem(id, user);
	}

	@Post()
	@RoleRequired(Role.USER)
	async createNoticeboardItem(@Body() noticeboardItem: NoticeboardItemDto, @Query() queryParams: CreateNoticeboardItemParamDto, @CurrentUser() user: UserInfo): Promise<IdWrapper> {
		if (noticeboardItem.id !== undefined) {
			throw new BadRequestException('ID is forbidden for create request');
		}

		return this.noticeboardService.createNoticeboardItem(noticeboardItem as NoticeboardItemDto & { id: undefined }, queryParams.postOnDiscord || false, user);
	}

	@Put(':id')
	@RoleRequired(Role.USER)
	async editNoticeboardItem(@Param('id', ParseIntPipe) id: number, @Body() noticeboardItem: NoticeboardItemDto, @CurrentUser() user: UserInfo): Promise<void> {
		const noticeboardItemToEdit = new NoticeboardItemDto({...noticeboardItem, id}) as NoticeboardItemDto & { id: number };
		await this.noticeboardService.editNoticeboardItem(noticeboardItemToEdit, user);
	}

	@Delete(':id')
	@RoleRequired(Role.USER)
	async deleteNoticeboardItem(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserInfo): Promise<void> {
		await this.noticeboardService.deleteNoticeboardItem(id, user);
	}

	@Get()
	async getNoticeboardItemList(@ClientRegion() region: SiteRegion, @Query('characterId') characterId?: string): Promise<NoticeboardItemSummaryDto[]> {
		return this.noticeboardService.getNoticeboardItemList(region, characterId ? { characterId : parseInt(characterId, 10) } : {});
	}
}
