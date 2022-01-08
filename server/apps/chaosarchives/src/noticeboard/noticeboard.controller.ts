import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { NoticeboardItemSummaryDto } from '@app/shared/dto/noticeboard/noticeboard-item-summary.dto';
import { NoticeboardItemDto } from '@app/shared/dto/noticeboard/noticeboard-item.dto';
import { Role } from '@app/shared/enums/role.enum';
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { NoticeboardService } from './noticeboard.service';

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
	async createNoticeboardItem(@Body() story: NoticeboardItemDto, @CurrentUser() user: UserInfo): Promise<IdWrapper> {
		if (story.id !== undefined) {
			throw new BadRequestException('ID is forbidden for create request');
		}

		return this.noticeboardService.createNoticeboardItem(story as NoticeboardItemDto & { id: undefined }, user);
	}

	@Put(':id')
	@RoleRequired(Role.USER)
	async editNoticeboardItem(@Param('id', ParseIntPipe) id: number, @Body() story: NoticeboardItemDto, @CurrentUser() user: UserInfo): Promise<void> {
		const storyToEdit = new NoticeboardItemDto({...story, id}) as NoticeboardItemDto & { id: number };
		await this.noticeboardService.editNoticeboardItem(storyToEdit, user);
	}

	@Delete(':id')
	@RoleRequired(Role.USER)
	async deleteNoticeboardItem(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserInfo): Promise<void> {
		await this.noticeboardService.deleteNoticeboardItem(id, user);
	}

	@Get()
	async getNoticeboardItemList(@Query('characterId') characterId?: string): Promise<NoticeboardItemSummaryDto[]> {
		return this.noticeboardService.getNoticeboardItemList(characterId ? { characterId : parseInt(characterId, 10) } : {});
	}
}
