import { Character, Story, StoryTag } from '@app/entity';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import html from '@app/shared/html';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, In, Not, Repository } from 'typeorm';
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

  async createStory(storyDto: StoryDto & { id: undefined }, user: UserInfo): Promise<IdWrapper> {
    const storyEntity = await this.connection.transaction(async em => {
			const storyRepo = em.getRepository(Story);
			
			const story = storyRepo.create({
				owner: {
					id: user.character.id
				},
				title: storyDto.title,
				content: html.sanitize(storyDto.content),
				type: storyDto.type
			});

			story.tags = storyDto.tags.map(tag => new StoryTag({
				name: tag,
				story
			}));

			return storyRepo.save(story);
		});
		
		return {
			id: storyEntity.id
		};
  }

  async editStory(storyDto: StoryDto & { id: number }, user: UserInfo): Promise<void> {
    await this.connection.transaction(async em => {
			const storyRepo = em.getRepository(Story);
			const story = await storyRepo.createQueryBuilder('story')
			.innerJoinAndSelect('story.owner', 'character')
			.innerJoinAndSelect('character.user', 'user')
			.where('story.id = :id', { id: storyDto.id })
			.andWhere('user.id = :userId', { userId: user.id })
			.select([ 'story' ])
			.getOne();

			if (!story) {
				throw new NotFoundException('Story not found');
			}
			
			Object.assign(story, {
				title: storyDto.title,
				content: html.sanitize(storyDto.content),
				type: storyDto.type
			});

			if (storyDto.tags.length > 0) {
				em.getRepository(StoryTag).delete({
					story: {
						id: storyDto.id
					},
					name: Not(In(storyDto.tags))
				});
			}

			story.tags = await em.getRepository(StoryTag).createQueryBuilder('tag')
				.innerJoinAndSelect('tag.story', 'story')
				.where('story.id = :id', { id: storyDto.id })
				.select('tag')
				.getMany();

			const existingTagNames = story.tags.map(tag => tag.name);
			const newTagNames = storyDto.tags.filter(tagName => !existingTagNames.includes(tagName));

			story.tags = [...story.tags, ...newTagNames.map(tag => new StoryTag({
				name: tag,
				story
			}))];

			await storyRepo.save(story);
		});
  }

	async deleteStory(id: number, user: UserInfo): Promise<void> {
		await this.connection.transaction(async em => {
			const storyRepo = em.getRepository(Story);
			const story = await storyRepo.createQueryBuilder('story')
			.innerJoinAndSelect('story.owner', 'character')
			.innerJoinAndSelect('character.user', 'user')
			.where('story.id = :id', { id })
			.andWhere('user.id = :userId', { userId: user.id })
			.select([ 'story.id' ])
			.getOne();

			if (!story) {
				throw new NotFoundException('Story not found');
			}

			await storyRepo.softRemove(story);
		});
	}

  async getStoryList(params: { characterId?: number, limit?: number }): Promise<StorySummaryDto[]> {
		const query = this.storyRepo.createQueryBuilder('story')
			.innerJoinAndSelect('story.owner', 'character')
      .orderBy('story.createdAt', 'DESC')
			.select([ 'story.id', 'character.name', 'story.title', 'story.createdAt' ])
      .limit(params.limit);

		if (params.characterId) {
			query.where('character.id = :characterId', { characterId: params.characterId });
		}

		const stories = await query.getMany();

		return stories.map(story => ({
				id: story.id,
				title: story.title,
				author: story.owner.name,
        createdAt: story.createdAt!.getTime(),
        type: story.type,
			}));
	}
}