import { Character, Story } from '@app/entity';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { NewProfileDto } from '@app/shared/dto/main-page/new-profile.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import { Role } from '@app/shared/enums/role.enum';
import html from '@app/shared/html';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, IsNull, Not, Repository } from 'typeorm';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserInfo } from '../auth/user-info';

@Injectable()
export class StoriesService {
  constructor(
    private connection: Connection,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    @InjectRepository(Story) private storyRepo: Repository<Story>,
  ) {}

  async getStory(
    id: number,
    @CurrentUser() user?: UserInfo,
  ): Promise<StoryDto> {
		const story = await this.storyRepo.findOne(id, {
			relations: [ 'character', 'tags' ],
		});

		if (!story) {
			throw new NotFoundException('Story not found');
		}

    return new StoryDto();
  }

  async createStory(story: Omit<StoryDto, 'id'>, user: UserInfo): Promise<void> {
    await this.connection.transaction(async em => {
			const repo = em.getRepository(Story);
			

			
		});
  }

  async editStory(story: StoryDto & { id: number }, user: UserInfo): Promise<void> {
    await this.connection.transaction(async em => {
			const repo = em.getRepository(Story);
			

			
		});
  }

	async deleteStory(id: number, user: UserInfo): Promise<void> {
		await this.connection.transaction(async em => {
			const repo = em.getRepository(Story);
			

			
		});
	}

  async getStoryList(limit?: number): Promise<StorySummaryDto[]> {
		const stories = await this.storyRepo.createQueryBuilder('story')
			.innerJoinAndSelect('story.owner', 'character')
      .orderBy('story.createdAt', 'DESC')
      .limit(limit)
			.select([ 'story.id', 'character.name', 'story.title', 'story.createdAt' ])
			.getMany();

		return stories.map(story => ({
				id: story.id,
				title: story.title,
				author: story.owner.name,
        createdAt: story.createdAt!.getTime(),
        type: story.type,
			}));
	}
}
