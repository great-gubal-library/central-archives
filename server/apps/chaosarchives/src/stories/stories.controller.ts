import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { UserInfo } from '../auth/user-info';
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
	@UseGuards(JwtAuthGuard)
	async createStory(@Body() story: Omit<StoryDto, 'id'>, @CurrentUser() user: UserInfo): Promise<void> {
		// TODO: Refactor
		if (user.role === Role.UNVERIFIED) {
			throw new ForbiddenException();
		}

		await this.storiesService.createStory(story, user);
	}

	@Put(':id')
	@UseGuards(JwtAuthGuard)
	async editStory(@Param('id', ParseIntPipe) id: number, @Body() story: Omit<StoryDto, 'id'>, @CurrentUser() user: UserInfo): Promise<void> {
		// TODO: Refactor
		if (user.role === Role.UNVERIFIED) {
			throw new ForbiddenException();
		}

		const storyToEdit = new StoryDto({...story, id}) as StoryDto & { id: number };
		await this.storiesService.editStory(storyToEdit, user);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	async deleteStory(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserInfo): Promise<void> {
		// TODO: Refactor
		if (user.role === Role.UNVERIFIED) {
			throw new ForbiddenException();
		}

		await this.storiesService.deleteStory(id, user);
	}

	@Get()
	async getStoryList(): Promise<StorySummaryDto[]> {
		return this.storiesService.getStoryList();
	}
}
