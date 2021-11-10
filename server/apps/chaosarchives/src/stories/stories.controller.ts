import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import { Role } from '@app/shared/enums/role.enum';
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@app/auth/current-user.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/optional-jwt-auth.guard';
import { RoleRequired } from '@app/auth/role-required.decorator';
import { UserInfo } from '@app/auth/user-info';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
	constructor(private storiesService: StoriesService) { }

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
	async getStoryList(@Query('characterId') characterId?: string): Promise<StorySummaryDto[]> {
		return this.storiesService.getStoryList(characterId ? { characterId : parseInt(characterId, 10) } : {});
	}
}
