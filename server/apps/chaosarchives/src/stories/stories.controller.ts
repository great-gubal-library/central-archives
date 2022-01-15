import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { StoryFilterDto } from '@app/shared/dto/stories/story-filter.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import { Role } from '@app/shared/enums/role.enum';
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
	constructor(private storiesService: StoriesService) { }

	@Get('tags')
	async getTags(): Promise<string[]> {
		return this.storiesService.getTags();
	}

	@Get(':id')
	@UseGuards(OptionalJwtAuthGuard)
	async getStory(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: UserInfo): Promise<StoryDto> {
		return this.storiesService.getStory(id, user);
	}

	@Post()
	@RoleRequired(Role.USER)
	async createStory(@Body() story: StoryDto, @CurrentUser() user: UserInfo): Promise<IdWrapper> {
		if (story.id !== undefined) {
			throw new BadRequestException('ID is forbidden for create request');
		}

		return this.storiesService.createStory(story as StoryDto & { id: undefined }, user);
	}

	@Put(':id')
	@RoleRequired(Role.USER)
	async editStory(@Param('id', ParseIntPipe) id: number, @Body() story: StoryDto, @CurrentUser() user: UserInfo): Promise<void> {
		const storyToEdit = new StoryDto({...story, id}) as StoryDto & { id: number };
		await this.storiesService.editStory(storyToEdit, user);
	}

	@Delete(':id')
	@RoleRequired(Role.USER)
	async deleteStory(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserInfo): Promise<void> {
		await this.storiesService.deleteStory(id, user);
	}

	@Get()
	async getStoryList(@Query() filter: StoryFilterDto): Promise<PagingResultDto<StorySummaryDto>> {
		return this.storiesService.getStoryList(filter);
	}
}
