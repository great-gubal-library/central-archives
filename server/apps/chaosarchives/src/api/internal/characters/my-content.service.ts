import { UserInfo } from '@app/auth/model/user-info';
import { Event, NoticeboardItem, Story } from '@app/entity';
import { BaseLinkResultDto } from '@app/shared/dto/common/base-link-result.dto';
import { MyContentDto } from '@app/shared/dto/characters/my-content.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';
import { MyContentItemDto } from '@app/shared/dto/characters/my-content-item.dto';

@Injectable()
export class MyContentService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Story) private storyRepo: Repository<Story>,
    @InjectRepository(NoticeboardItem) private noticeboardItemRepo: Repository<NoticeboardItem>,
    private imagesService: ImagesService,
  ) {}

  async getMyContent(characterId: number, user: UserInfo): Promise<MyContentDto> {
    if (!user.characters.some((ch) => ch.id === characterId && ch.verified)) {
      throw new NotFoundException('Invalid character ID');
    }

		const [ events, stories, noticeboardItems, images ] = await Promise.all([
			this.getEvents(characterId),
			this.getStories(characterId),
			this.getNoticeboardItems(characterId),
			this.imagesService.getMyImages(characterId, user),
		]);

    return {
      events,
      stories,
      noticeboardItems,
      images,
    };
  }

  private async getEvents(characterId: number): Promise<MyContentItemDto[]> {
    return (
      await this.eventRepo.find({
        where: {
          owner: {
						id: characterId
					},
        },
        order: { 'createdAt': 'DESC' },
        select: ['id', 'title', 'createdAt'],
      })
    ).map((event) => ({
      id: event.id,
      title: event.title,
      createdAt: event.createdAt.getTime(),
    }));
  }

  private async getStories(characterId: number): Promise<MyContentItemDto[]> {
    return (
      await this.storyRepo.find({
        where: {
          owner: {
						id: characterId
					}
        },
        order: { 'createdAt': 'DESC' },
        select: ['id', 'title', 'createdAt'],
      })
    ).map((story) => ({
      id: story.id,
      title: story.title,
      createdAt: story.createdAt.getTime(),
    }));
  }

  private async getNoticeboardItems(characterId: number): Promise<MyContentItemDto[]> {
    return (
      await this.noticeboardItemRepo.find({
        where: {
          owner: {
						id: characterId
					}
        },
        order: { 'createdAt': 'DESC' },
        select: ['id', 'title', 'createdAt'],
      })
    ).map((noticeboardItem) => ({
      id: noticeboardItem.id,
      title: noticeboardItem.title,
      createdAt: noticeboardItem.createdAt.getTime(),
    }));
  }
}
