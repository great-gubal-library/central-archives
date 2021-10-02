import { Character, Story, StoryTag } from '@app/entity';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { UserInfo } from '../auth/user-info';

@Injectable()
export class StoriesService {
  constructor(
    private connection: Connection,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    @InjectRepository(Story) private storyRepo: Repository<Story>,
		@InjectRepository(StoryTag) private storyTagRepo: Repository<StoryTag>,
  ) {}

  async getStory(
    id: number,
		user?: UserInfo,
  ): Promise<StoryDto> {
		const story = await this.storyRepo.createQueryBuilder('story')
			.innerJoinAndSelect('story.owner', 'character')
			.innerJoinAndSelect('character.user', 'user')
			.innerJoinAndSelect('character.server', 'server')
			.where('story.id = :id', { id })
			.select([ 'story', 'character.id', 'character.name', 'user.id', 'server.name' ])
			.getOne();

		if (!story) {
			throw new NotFoundException('Story not found');
		}

		story.tags = await this.storyTagRepo.createQueryBuilder('tag')
			.innerJoinAndSelect('tag.story', 'story')
			.where('story.id = :id', { id })
			.select('tag')
			.getMany();

    return new StoryDto({
			id: story.id,
			mine: user ? story.owner.user.id === user.id : false,
			author: story.owner.name,
			authorServer: story.owner.server.name,
			title: story.title,
			content: story.content,
			createdAt: story.createdAt!.getTime(),
			type: story.type,
			tags: story.tags.map(tag => tag.name),
		});
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
